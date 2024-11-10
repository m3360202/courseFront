'use client'

// React Imports
import { useEffect, useState } from 'react'

import './styles.css'

import { useGlobal } from '@/hooks/useGlobal'
import Title from '@/components/title'
import { IconButton } from '@mui/material'
import Link from 'next/link'

const NavSearch = () => {
  // States
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // Hooks
  const { title, backUrl } = useGlobal()

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)

    return () => document.removeEventListener('keydown', down)
  }, [])

  // Reset the search value when the menu is closed
  useEffect(() => {
    if (!open && searchValue !== '') {
      setSearchValue('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <>
      <div className='flex items-center gap-2'>
        {backUrl &&
          backUrl.map(url => (
            <IconButton key={url} className='text-textPrimary' component={Link} href={url}>
              <i className='ri-arrow-left-line'></i>
            </IconButton>
          ))}
        <div className='hidden md:block'>
          <Title variant='h5'>{title}</Title>
        </div>
      </div>

      {/* {isBreakpointReached || settings.layout === 'horizontal' ? (
        <IconButton className='text-textPrimary' onClick={() => setOpen(true)}>
          <i className='ri-search-line text-textPrimary' />
        </IconButton>
      ) : (
        <div className='flex items-center gap-2 cursor-pointer' onClick={() => setOpen(true)}>
          <IconButton className='text-textPrimary' onClick={() => setOpen(true)}>
            <i className='ri-search-line text-textPrimary' />
          </IconButton>
          <div className='whitespace-nowrap select-none text-textDisabled'>Search ⌘K</div>
        </div>
      )}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className='flex items-center justify-between border-be pli-4 plb-3 gap-2'>
          <i className='ri-search-line' />
          <CommandInput value={searchValue} onValueChange={setSearchValue} />
          <span className='text-textDisabled'>[esc]</span>
          <i className='ri-close-line cursor-pointer' onClick={() => setOpen(false)} />
        </div>
        <CommandList>
          {searchValue ? (
            limitedData.length > 0 ? (
              limitedData.map((section, index) => (
                <CommandGroup key={index} heading={section.title.toUpperCase()} className='text-xs'>
                  {section.items.map((item, index) => {
                    return (
                      <SearchItem
                        shortcut={item.shortcut}
                        key={index}
                        currentPath={pathName}
                        url={getLocalizedUrl(item.url, locale as Locale)}
                        value={`${item.name} ${section.title} ${item.shortcut}`}
                        onSelect={() => onSearchItemSelect(item)}
                      >
                        {item.icon && (
                          <div className='flex text-xl'>
                            <i className={classnames(item.icon, 'text-xl')} />
                          </div>
                        )}
                        {item.name}
                      </SearchItem>
                    )
                  })}
                </CommandGroup>
              ))
            ) : (
              <CommandEmpty>
                <NoResult searchValue={searchValue} setOpen={setOpen} />
              </CommandEmpty>
            )
          ) : (
            <DefaultSuggestions setOpen={setOpen} />
          )}
        </CommandList>
        {isAboveMdScreen && <CommandFooter />}
      </CommandDialog> */}
    </>
  )
}

export default NavSearch
