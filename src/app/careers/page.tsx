'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Briefcase, Clock, Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Footer from '@/components/footer'
import { LandingNavbar } from '@/components/navbar/landing-navbar'
import { ParallaxBackground } from '@/components/motion/parallax-scroll'

// Type definitions
interface Job {
  id: string
  title: string
  department: string
  location: string
  locationType: string
  type: string
  postedDate: string
  description: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  isActive: boolean
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    department: '',
    locationType: '',
    type: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/careers/jobs?active=true')
        const data = await response.json()
        
        if (data.jobs) {
          setJobs(data.jobs)
          setFilteredJobs(data.jobs)
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [])

  // Filter jobs when search query or filters change
  useEffect(() => {
    const filtered = jobs.filter(job => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Department filter
      const matchesDepartment = filters.department === '' || 
        job.department === filters.department;
      
      // Location type filter
      const matchesLocationType = filters.locationType === '' || 
        job.locationType === filters.locationType;
      
      // Job type filter
      const matchesType = filters.type === '' || 
        job.type === filters.type;
      
      return matchesSearch && matchesDepartment && matchesLocationType && matchesType;
    });
    
    setFilteredJobs(filtered);
  }, [searchQuery, filters, jobs]);

  // Get unique departments, location types, and job types for filter options
  const departments = Array.from(new Set(jobs.map(job => job.department)))
  const locationTypes = Array.from(new Set(jobs.map(job => job.locationType)))
  const jobTypes = Array.from(new Set(jobs.map(job => job.type)))
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('')
    setFilters({
      department: '',
      locationType: '',
      type: '',
    })
  }
  
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date)
  }
  
  // Get badge for location type
  const getLocationBadge = (locationType: string) => {
    switch (locationType.toLowerCase()) {
      case 'remote':
        return <Badge className="bg-blue-100 text-blue-800">Remote</Badge>
      case 'office':
        return <Badge className="bg-purple-100 text-purple-800">Office</Badge>
      case 'hybrid':
        return <Badge className="bg-green-100 text-green-800">Hybrid</Badge>
      default:
        return <Badge>{locationType}</Badge>
    }
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-background via-background to-background/80 overflow-hidden">
      {/* Background */}
      <ParallaxBackground />
      
      {/* Navbar */}
      <LandingNavbar />
      
      {/* Hero Section */}
      <section id="careers-hero" className="relative min-h-[50vh] md:min-h-[60vh] flex items-center pt-16 sm:pt-20 md:pt-24 lg:pt-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Join Our Team</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Discover opportunities to make an impact and grow your career with us.
          </p>
        </div>
      </section>
      
      {/* Job Search */}
      <section className="py-8 relative">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10 bg-background"
                  placeholder="Search jobs by title, description, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              {(searchQuery || filters.department || filters.locationType || filters.type) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFilters}
                  title="Clear filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Filter options */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Select
                      value={filters.department}
                      onValueChange={(value) => setFilters({ ...filters, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={filters.locationType}
                      onValueChange={(value) => setFilters({ ...filters, locationType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Location Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Location Types</SelectItem>
                        {locationTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilters({ ...filters, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Job Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Job Types</SelectItem>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
      
      {/* Main content */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Job count */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {loading ? (
                <span className="animate-pulse">Loading jobs...</span>
              ) : (
                <>
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Available
                </>
              )}
            </h2>
          </div>
          
          {/* Job listings */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card rounded-xl border border-border/50 p-6 animate-pulse">
                  <div className="h-7 bg-muted rounded w-1/3 mb-4"></div>
                  <div className="flex gap-4 mb-4">
                    <div className="h-5 bg-muted rounded w-24"></div>
                    <div className="h-5 bg-muted rounded w-24"></div>
                    <div className="h-5 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-card rounded-xl border border-border/50 overflow-hidden transition-all hover:shadow-md"
                >
                  <Accordion type="single" collapsible>
                    <AccordionItem value={job.id} className="border-none">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex-1 text-left">
                          <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {job.type.replace('-', ' ')}
                            </span>
                            <div>
                              {getLocationBadge(job.locationType)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              Posted on {formatDate(job.postedDate)}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-5">
                        <div className="prose prose-gray max-w-none">
                          <p className="mb-4">{job.description}</p>
                          
                          <h4 className="text-lg font-semibold mb-2">Requirements:</h4>
                          <ul className="list-disc pl-5 space-y-1 mb-4">
                            {job.requirements.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                          
                          <h4 className="text-lg font-semibold mb-2">Responsibilities:</h4>
                          <ul className="list-disc pl-5 space-y-1 mb-4">
                            {job.responsibilities.map((resp, i) => (
                              <li key={i}>{resp}</li>
                            ))}
                          </ul>
                          
                          <Separator className="my-4" />
                          
                          <div className="flex justify-end">
                            <Link href={`/careers/${job.id}`}>
                              <Button className="bg-primary hover:bg-primary/90">Apply Now</Button>
                            </Link>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
              <h3 className="text-xl font-semibold mb-2">No matching jobs found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search filters or check back later for new opportunities.</p>
              <Button onClick={resetFilters} variant="outline">Clear Filters</Button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
} 