// Custom Hook - Product Data Fetching

"use client"

import useSWR from "swr"
import type { Product } from "@/lib/types/models"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProducts(category?: string) {
  const url = category
    ? `/api/products?category=${encodeURIComponent(category)}&active=true`
    : "/api/products?active=true"

  const { data, error, isLoading, mutate } = useSWR(url, fetcher)

  return {
    products: (data?.data as Product[]) || [],
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useProduct(productId: string) {
  const { data, error, isLoading, mutate } = useSWR(productId ? `/api/products/${productId}` : null, fetcher)

  return {
    product: data?.data as Product | undefined,
    isLoading,
    isError: error,
    refresh: mutate,
  }
}
