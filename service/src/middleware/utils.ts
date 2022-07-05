class sortDataUtils {
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

    selectFields(array: any, select: any) {
        return array.map((item: any) => {
            if (select === 'all') {
                return item
            } else {
                return select.split(',').reduce((obj: any, key: any) => {
                    obj[key] = item[key]
                    return obj
                }, {})
            }
        }
        )
    }
}

const sortData = new sortDataUtils()

export default sortData