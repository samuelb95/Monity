export const filterMenuOpenEvent = 'monity:transaction-filter-menu-open'
export const filterMenuCloseEvent = 'monity:transaction-filter-menu-close'

export function closeTransactionFilterMenus() {
  document.dispatchEvent(new CustomEvent(filterMenuCloseEvent))
}
