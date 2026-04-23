import React from 'react'

type Props = {
  title: string
  value: number | undefined
  icon: JSX.Element
  sales?: boolean
}

const DashboardCard = ({ icon, title, value = 0, sales }: Props) => {
  return (
    <div className="rounded-lg flex flex-col gap-3 p-6 border-[1px] border-indigo-200 bg-indigo-50 dark:bg-indigo-800 dark:border-indigo-700 flex-1">
      <div className="flex gap-3">
        {icon}
        <h2 className="font-bold text-xl text-indigo-900 dark:text-indigo-100">{title}</h2>
      </div>
      <p className="font-bold text-4xl text-indigo-600 dark:text-indigo-300">
        {sales && '$'}
        {value}
      </p>
    </div>
  )
}

export default DashboardCard
