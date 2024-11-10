'use client'

import { createContext } from 'react'

export interface ListTableContextInterface {
  pageIndex: number
  pageSize: number
  total: number
  searchValue: string
  rowSelectionData: Record<number, any>

  setPageIndex: (pageIndex: number) => void
  setPageSize: (pageSize: number) => void
  setTotal: (total: number) => void
  setSearchValue: (searchValue: string) => void
  setRowSelectionData: (updater: (prevStore: Record<number, any>) => Record<number, any>) => void;
}

const ListTableContext = createContext<ListTableContextInterface | null>(null)

export default ListTableContext
