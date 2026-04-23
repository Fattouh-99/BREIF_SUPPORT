'use client'

import { usePathname } from 'next/navigation'
import React from 'react'
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator 
} from '../ui/breadcrumb'

const BreadCrumb = () => {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {paths.map((path, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${paths.slice(0, index + 1).join('/')}`}>
                <h1 className="text-xl font-semibold text-muted-foreground">{path.charAt(0).toUpperCase() + path.slice(1)}</h1>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < paths.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadCrumb
