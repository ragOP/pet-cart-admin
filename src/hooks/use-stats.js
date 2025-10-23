import { useQuery } from '@tanstack/react-query'
import { 
  getMonthlyStats, 
  getCustomerStats, 
  getTopCategories, 
  getTopSubcategories, 
  getTopProducts, 
  getTotalSales 
} from '../api/api_services/stats'

// Query keys for consistent caching
export const statsKeys = {
  all: ['stats'],
  monthly: () => [...statsKeys.all, 'monthly'],
  customers: () => [...statsKeys.all, 'customers'],
  topCategories: () => [...statsKeys.all, 'topCategories'],
  topSubcategories: () => [...statsKeys.all, 'topSubcategories'],
  topProducts: () => [...statsKeys.all, 'topProducts'],
  totalSales: () => [...statsKeys.all, 'totalSales'],
}

// Monthly stats hook
export const useMonthlyStats = () => {
  return useQuery({
    queryKey: statsKeys.monthly(),
    queryFn: getMonthlyStats,
    select: (data) => data?.data || [],
  })
}

// Customer stats hook
export const useCustomerStats = () => {
  return useQuery({
    queryKey: statsKeys.customers(),
    queryFn: getCustomerStats,
    select: (data) => data?.data || [],
  })
}

// Top categories hook
export const useTopCategories = () => {
  return useQuery({
    queryKey: statsKeys.topCategories(),
    queryFn: getTopCategories,
    select: (data) => data?.data || [],
  })
}

// Top subcategories hook
export const useTopSubcategories = () => {
  return useQuery({
    queryKey: statsKeys.topSubcategories(),
    queryFn: getTopSubcategories,
    select: (data) => data?.data || [],
  })
}

// Top products hook
export const useTopProducts = () => {
  return useQuery({
    queryKey: statsKeys.topProducts(),
    queryFn: getTopProducts,
    select: (data) => data?.data || [],
  })
}

// Total sales hook
export const useTotalSales = () => {
  return useQuery({
    queryKey: statsKeys.totalSales(),
    queryFn: getTotalSales,
    select: (data) => data?.data || [],
  })
}

// Individual hooks are already defined above - no need for a combined hook
// Each component can use the specific hook it needs
