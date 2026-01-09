# AWS Free Tier Deployment Guide for Static React Website (ncissues_docs_site)

This guide provides step-by-step instructions to deploy your static React documentation website (the `dist` folder from the `ncissues_docs_site` project) to AWS using services that offer a generous free tier. We will cover two common methods: **AWS S3 + CloudFront** and **AWS Amplify**.

**Prerequisites:**

*   An AWS Account. If you don't have one, you can sign up at [aws.amazon.com](https://aws.amazon.com/).
*   The built static website files (the contents of the `/home/ubuntu/ncissues_docs_site/dist` directory).
*   AWS Command Line Interface (CLI) installed and configured (optional, but helpful for S3 uploads).

## Method 1: AWS S3 + CloudFront (Recommended for Control and CDN Benefits)

This method involves using Amazon S3 (Simple Storage Service) to host your static files and Amazon CloudFront as a Content Delivery Network (CDN) to distribute your site globally with low latency and provide HTTPS.

**AWS Free Tier Details:**
*   **S3:** 5GB of standard storage, 20,000 Get Requests, and 2,000 Put Requests per month for the first 12 months.
*   **CloudFront:** 1TB of data transfer out, 10,000,000 HTTP or HTTPS Requests, and 2,000,000 CloudFront Function invocations per month (always free, not just for 12 months).

### Step 1: Create an S3 Bucket

1.  **Navigate to S3:** Open the AWS Management Console and go to the S3 service.
2.  **Create Bucket:** Click "Create bucket".
    *   **Bucket name:** Choose a globally unique name (e.g., `ncissues-docs-yourname`). It's a good practice to use a name similar to your domain if you plan to use one.
    *   **AWS Region:** Select a region close to you or your primary audience.
    *   **Block Public Access settings for this bucket:** **Uncheck** "Block *all* public access". You will need to acknowledge that the bucket will be public. This is necessary for website hosting. However, we will refine permissions later.
    *   Leave other settings as default and click "Create bucket".

### Step 2: Upload Website Files to S3 Bucket

1.  **Open your bucket:** Click on the name of the bucket you just created.
2.  **Upload files:**
    *   Click the "Upload" button.
    *   Drag and drop all files and folders from your local `dist` directory (e.g., `/home/ubuntu/ncissues_docs_site/dist`) into the upload area, or use "Add files" and "Add folder".
    *   Ensure the `index.html` file is at the root of the bucket.
    *   Under "Permissions", ensure "Grant public-read access" is selected if prompted during upload (or you can set this later via a bucket policy).
    *   Click "Upload".

### Step 3: Enable Static Website Hosting on S3 Bucket

1.  **Go to Properties:** In your S3 bucket, go to the "Properties" tab.
2.  **Static website hosting:** Scroll down to the bottom and click "Edit" in the "Static website hosting" section.
    *   **Enable** static website hosting.
    *   **Hosting type:** Select "Host a static website".
    *   **Index document:** Enter `index.html`.
    *   **Error document (optional):** You can also specify `index.html` or a custom error page if you have one.
    *   Click "Save changes".
3.  **Note the Endpoint URL:** After saving, S3 will provide a "Bucket website endpoint" URL. You can test your site using this URL, but it will be HTTP only and not use the CDN yet.

### Step 4: Set Bucket Policy for Public Access

1.  **Go to Permissions:** In your S3 bucket, go to the "Permissions" tab.
2.  **Bucket policy:** Click "Edit" in the "Bucket policy" section.
3.  **Paste the policy:** Copy and paste the following JSON policy, replacing `YOUR_BUCKET_NAME` with your actual S3 bucket name:
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
            }
        ]
    }
    ```
4.  Click "Save changes". Your website should now be accessible via the S3 website endpoint.

### Step 5: Create a CloudFront Distribution

1.  **Navigate to CloudFront:** Open the AWS Management Console and go to the CloudFront service.
2.  **Create Distribution:** Click "Create distribution".
    *   **Origin domain:** Select your S3 bucket from the dropdown list. **Important:** Choose the S3 bucket REST API endpoint (e.g., `your-bucket-name.s3.amazonaws.com`), NOT the S3 static website hosting endpoint.
    *   **Origin path:** Leave blank if your `index.html` is at the root of the bucket.
    *   **S3 bucket access:** Select "Yes use OAI (Origin Access Identity)".
        *   Click "Create new OAI".
        *   **Bucket policy:** Select "Yes, update the bucket policy". CloudFront will automatically update your S3 bucket policy to only allow access from CloudFront, which is more secure.
    *   **Viewer protocol policy:** Select "Redirect HTTP to HTTPS".
    *   **Allowed HTTP methods:** Select "GET, HEAD, OPTIONS".
    *   **Cache key and origin requests:** For most static sites, "CachingOptimized" is fine. If you have issues with updates, you might need to adjust cache policies or create invalidations.
    *   **Price Class:** Select "Use all edge locations (best performance)" or choose a more restricted set to potentially save costs (though the free tier is generous).
    *   **Default root object:** Enter `index.html`.
    *   Leave other settings as default unless you have specific needs (like a custom domain, which requires AWS Certificate Manager for HTTPS).
    *   Click "Create distribution".
3.  **Wait for Deployment:** CloudFront distributions can take 10-20 minutes to deploy. You can monitor the status in the CloudFront console.
4.  **Access your site:** Once deployed, use the "Distribution domain name" (e.g., `d12345abcdef.cloudfront.net`) provided by CloudFront to access your website via HTTPS.

### Step 6: Handling Single Page Application (SPA) Routing (Important for React Router)

If you are using React Router, direct navigation to sub-paths (e.g., `your-site.com/some-page`) might result in a 404 or 403 error from S3 because S3 looks for a file at that specific path.

1.  **CloudFront Error Pages:**
    *   In your CloudFront distribution settings, go to the "Error pages" tab.
    *   Click "Create custom error response".
    *   **HTTP error code:** Select `403: Forbidden`.
    *   **Customize error response:** Select "Yes".
    *   **Response page path:** Enter `/index.html`.
    *   **HTTP Response code:** Select `200: OK`.
    *   Click "Create custom error response".
    *   Repeat this process for `404: Not Found` errors as well, pointing them to `/index.html` with a `200: OK` response.

This configuration ensures that all paths are routed to your `index.html`, allowing React Router to handle the client-side routing.

## Method 2: AWS Amplify (Simpler for CI/CD and Hosting)

AWS Amplify provides a more streamlined experience for hosting web applications, including CI/CD (Continuous Integration/Continuous Deployment) capabilities.

**AWS Free Tier Details:**
*   **Build & Deploy:** 1,000 build minutes per month for the first 12 months.
*   **Hosting:** 5GB stored and 15GB served per month for the first 12 months.

### Step 1: Prepare Your Project (if using Git)

Amplify works best if your project is in a Git repository (e.g., GitHub, GitLab, Bitbucket, AWS CodeCommit).

1.  Ensure your `dist` folder (or your build output directory) is correctly generated by your build command (`pnpm run build`).
2.  Commit your code, including the build script configuration in `package.json`.

### Step 2: Connect Your App to AWS Amplify

1.  **Navigate to Amplify:** Open the AWS Management Console and go to the AWS Amplify service.
2.  **Host web app:** Under "Getting started" or "All apps", click "Host web app".
3.  **Choose your Git provider:** Select GitHub, Bitbucket, GitLab, or AWS CodeCommit and authorize Amplify to access your repositories.
4.  **Select your repository and branch:** Choose the repository containing your React app and the branch you want to deploy (e.g., `main` or `master`).
5.  **Configure build settings:**
    *   Amplify will usually detect that it's a React app and suggest build settings. Review them.
    *   **App root:** Should be the root of your project.
    *   **Build command:** Ensure it's correct (e.g., `pnpm run build`).
    *   **Base directory (artifacts):** This should point to your build output directory (e.g., `dist`).
    *   You can edit these settings by clicking "Edit" or by modifying the `amplify.yml` file that Amplify might add to your repository.
    *   A typical `amplify.yml` for a React app built with Vite (like the template used) might look like this:
        ```yaml
        version: 1
        frontend:
          phases:
            preBuild:
              commands:
                - pnpm install
            build:
              commands:
                - pnpm run build
          artifacts:
            baseDirectory: dist
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
        ```
6.  **Save and Deploy:** Click "Save and deploy".

### Step 3: Wait for Deployment

Amplify will provision resources, build your code, and deploy your application. This process might take a few minutes. You can monitor the progress in the Amplify console.

### Step 4: Access Your Site

Once deployed, Amplify will provide a default URL (e.g., `https://branch-name.d12345abcdef.amplifyapp.com`).

### Step 5: Handling SPA Routing (Redirects for React Router)

Amplify usually handles SPA redirects well by default, but if you encounter issues:

1.  In the Amplify console for your app, go to "Rewrites and redirects".
2.  Add a new rule:
    *   **Source address:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
    *   **Target address:** `/index.html`
    *   **Type:** `200 (Rewrite)`
3.  Save the rule. This ensures all paths not matching static file extensions are routed to `index.html`.

## Choosing Between S3+CloudFront and Amplify

*   **S3 + CloudFront:**
    *   **Pros:** More control over individual services, powerful CDN, potentially more cost-effective beyond the initial free tier for very high traffic due to granular control. CloudFront's free tier for data transfer is ongoing.
    *   **Cons:** More complex setup.
*   **AWS Amplify:**
    *   **Pros:** Much simpler setup, integrated CI/CD, good for rapid development and deployment.
    *   **Cons:** Free tier for build minutes and hosting is for the first 12 months. Can sometimes feel like a "black box" if deep customization is needed.

For a static documentation site, **AWS Amplify** is often a quicker and easier way to get started, especially if you are already using Git. If you prefer more control or anticipate needing a very robust CDN setup from the get-go, S3 + CloudFront is a solid choice.

**Remember to monitor your AWS Free Tier usage via the AWS Billing console to avoid unexpected charges.**

After you've deployed using one of these methods, please provide the live URL so I can validate it.
