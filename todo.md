# Project TODO

- [x] Database schema for legislators, committees, district lookup cache
- [x] Backend API: geocode address to lat/lng using Google Maps
- [x] Backend API: lookup NC legislative districts from geocoded address (ArcGIS Feature Services)
- [x] Backend API: fetch legislator data from ncleg.gov webservices
- [x] Backend API: fetch committee data from ncleg.gov webservices
- [ ] Backend API: fetch bill data from ncleg.gov webservices
- [x] Backend tRPC router for Find Your Legislator
- [x] Frontend: Find Your Legislator page with address input
- [x] Frontend: Display legislator results with district, party, contact info
- [x] Frontend: Navigation and layout for NC Issues app
- [x] Error handling and user feedback for failed lookups
- [x] Validate address-to-district mapping with NC addresses (Raleigh, Charlotte, Asheville)
- [x] Unit tests for legislator lookup
- [x] Fix: Replace defunct Google Civic Info API with official NCGA ArcGIS Feature Services
- [x] Fix: Add retry logic with sequential queries for ArcGIS reliability
- [x] Fix: Cache district lookups to avoid repeated ArcGIS queries
