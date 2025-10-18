'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from './ui/button'

interface SearchFormProps {
  defaultValue?: string
  placeholder?: string
  route?: string
}

export function SearchForm({
  defaultValue = '',
  placeholder = 'Search spells...',
  route
}: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Use the provided route or detect from pathname
  const targetRoute = route || pathname

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get('search') as string

    // Preserve other search params like language, visibility, etc.
    const params = new URLSearchParams(searchParams.toString())

    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }

    const queryString = params.toString()
    router.push(queryString ? `${targetRoute}?${queryString}` : targetRoute)
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex">
      <Input
        type="search"
        name="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="flex-1 rounded-r-none"
      />

      <Button type="submit" size="default" className="rounded-l-none">
        <Search />
        Search
      </Button>
    </form>
  )
}
