const getSourceUrl = (source: string | null) => {
    switch (source) {
        case 'dashboardPage':
            return '/dashboard'
        case 'searchPage':
            return '/search?redirectTo=search'
        default:
            return null
    }
}

export default getSourceUrl
