'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Department {
  id: number;
  department_name: string;
  department_code: string;
  description: string;
  primary_function: string;
  services_provided: string[];
  director_name: string;
  email: string;
  phone: string;
  office_location: string;
  website_url: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              NC Issues
            </Link>
            <nav className="flex gap-6">
              <Link href="/learn" className="text-gray-700 hover:text-blue-900">
                ← Back to Learn
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Legislative Departments</h1>
            <p className="text-gray-600">
              Directory of NC General Assembly departments, divisions, and support services
            </p>
          </div>

          {/* Departments List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
              <p className="mt-4 text-gray-600">Loading departments...</p>
            </div>
          ) : departments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No departments found</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {departments.map((dept) => (
                <div key={dept.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{dept.department_name}</h2>
                        {dept.department_code && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {dept.department_code}
                          </span>
                        )}
                      </div>
                      {dept.description && (
                        <p className="text-gray-600 mb-3">{dept.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    {/* Primary Function */}
                    {dept.primary_function && (
                      <div>
                        <p className="text-gray-500 font-medium mb-2">Primary Function</p>
                        <p className="text-gray-700">{dept.primary_function}</p>
                      </div>
                    )}

                    {/* Services Provided */}
                    {dept.services_provided && dept.services_provided.length > 0 && (
                      <div>
                        <p className="text-gray-500 font-medium mb-2">Services Provided</p>
                        <ul className="text-gray-700 space-y-1">
                          {dept.services_provided.slice(0, 3).map((service, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-900 mt-1">•</span>
                              <span>{service}</span>
                            </li>
                          ))}
                          {dept.services_provided.length > 3 && (
                            <li className="text-sm text-gray-500">
                              +{dept.services_provided.length - 3} more services
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-gray-500 font-medium mb-3">Contact Information</p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      {dept.email && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📧</span>
                          <a href={`mailto:${dept.email}`} className="text-blue-900 hover:underline">
                            {dept.email}
                          </a>
                        </div>
                      )}
                      {dept.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📞</span>
                          <a href={`tel:${dept.phone}`} className="text-blue-900 hover:underline">
                            {dept.phone}
                          </a>
                        </div>
                      )}
                      {dept.website_url && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">🌐</span>
                          <a
                            href={dept.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-900 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                    {dept.director_name && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Director:</span> {dept.director_name}
                      </div>
                    )}
                    {dept.office_location && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {dept.office_location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">About Legislative Departments</h3>
            <p className="text-gray-700 mb-4">
              The NC General Assembly is supported by professional staff in various departments and divisions. 
              These departments provide essential services including bill drafting, fiscal analysis, research, 
              technology support, and administrative services to help legislators make informed decisions.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900 mb-1">Non-Partisan Support</p>
                <p className="text-gray-600">
                  Legislative staff provide objective, non-partisan analysis and support to all members regardless of party affiliation
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Professional Expertise</p>
                <p className="text-gray-600">
                  Departments employ subject matter experts in law, finance, policy, research, and technology
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
