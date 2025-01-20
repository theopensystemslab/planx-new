import { Navigation, Route } from "navi";

import { FilterState, FilterValues } from "./Filters";

export const addToSearchParams = (
  params: FilterState,
  route: Route<any>,
  navigation: Navigation<any>,
) => {
  const searchParams = new URLSearchParams(route.url.search);

  // Update or remove filter parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  });

  navigation.navigate(
    {
      pathname: window.location.pathname,
      search: searchParams.toString(), // Use the complete searchParams object
    },
    {
      replace: true,
    },
  );
};

export const clearSearchParams = (
  route: Route<any>,
  navigation: Navigation<any>,
) => {
  const searchParams = new URLSearchParams(route.url.search);
  searchParams.delete("status");
  searchParams.delete("applicationType");
  searchParams.delete("serviceType");
  navigation.navigate(
    {
      pathname: window.location.pathname,
      search: searchParams.toString(), // Use the complete searchParams object
    },
    {
      replace: true,
    },
  );
};

export const filterSelectedFilters = (
  selectedFilters: FilterValues[] | string[] | [],
  filterTarget: string,
) => {
  const newSelectedFilters =
    (selectedFilters.filter(
      (selectedFilter) =>
        selectedFilter !== filterTarget && selectedFilter !== undefined,
    ) as string[]) || [];
  return newSelectedFilters;
};
// export const findFilterFromKey = (targetFi)
//   export const deleteFilterChip = () => {
//                         filterSelectedFilters(newSelectedFilters);
//                         if (filters) {
//                           const deleteFilter = Object.keys(filters) as FilterKeys[];
//                           const targetFilter = deleteFilter.find(
//                             (key: FilterKeys) => {
//                               return filters[key] === filter;
//                             },
//                           );

//                           if (targetFilter) {
//                             const newFilters = { ...filters };
//                             delete newFilters[targetFilter];
//                             removeFilter(targetFilter);
//                             addToSearchParams({
//                               ...filters,
//                               [targetFilter]: undefined
//                             }, route, navigation);
//                             handleFiltering(newFilters);
//                           }
//                         }
//   }
