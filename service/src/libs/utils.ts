class sortPageUtils {
    constructor() { }

    paginateArray(array: any, perPage: any, page: any) {
        return array.slice((page - 1) * perPage, page * perPage)
    }

    sortCompare(key: any) {
        return (a: any, b: any) => {
            const fieldA = a[key]
            const fieldB = b[key]

            let comparison = 0
            if (fieldA > fieldB) {
                comparison = 1
            } else if (fieldA < fieldB) {
                comparison = -1
            }
            return comparison
        }
    }
}

const sort_Page = new sortPageUtils()

export default sort_Page