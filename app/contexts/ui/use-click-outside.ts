import { useEffect } from 'react'

export default function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  const handleClick = (e: MouseEvent) => {
    if (ref && ref.current && !ref.current.contains(e.target as Node)) {
      callback()
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  })
}
