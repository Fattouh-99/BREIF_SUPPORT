import React from 'react'

type Props = {}

const ProductIcon = (props: Props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-indigo-900 dark:text-indigo-100"
    >
      <path
        d="M6 2L3 6V14C3 15.1046 3.89543 16 5 16H19C20.1046 16 21 15.1046 21 14V6L18 2H6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 6H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default ProductIcon 