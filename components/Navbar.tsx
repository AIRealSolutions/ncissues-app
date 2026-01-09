import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:text-blue-200">
          NC Issues Documentation
        </Link>
        <div className="flex gap-4">
          <a 
            href="https://www.ncleg.gov/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-200"
          >
            NC Legislature
          </a>
        </div>
      </div>
    </nav>
  );
}
