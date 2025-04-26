export async function specialTableDeal(data) {
    const dealingData = JSON.parse(data)
    console.log("进入特殊化", dealingData)
    // 去除第一行和第二行，并判断length不为1，记录所有行的[0]信息
    let reField = [{
        "fieldName": null,
        "fieldNameCh": '--不匹配---'
    }]
    dealingData.forEach((i, index) => {
        if (index > 1 && i.length > 1) {
            reField.push({
                "fieldName": i[0],
                "fieldNameCh": i[0]
            })
        }
    })
    return reField
}

export async function normalTableDeal(data) {
    const dealingData = JSON.parse(data)
    console.log("进入正常表格处理", dealingData)
    // 直接获取第一行和第二行组成fields
    const fieldsEn = dealingData[0];
    const fieldsCn = dealingData[1];
    const reField = fieldsEn.map((item, index) => {
        return {
            "fieldName": item,
            "fieldNameCh": fieldsCn[index]
        }
    })
    return [{
        "fieldName": null,
        "fieldNameCh": '--不匹配---'
    }, ...reField]
}

export const columns = [
    {
        title: '系统字段',
        dataIndex: 'tableNameZhSource',
        key: 'tableNameZhSource',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#f9fafb',
                    padding: '5px',
                    color: '#6b7280',
                }
            };
        },
        scopedSlots: { customRender: 'tableNameZhSource' },
    },
    {
        title: '导入文件字段',
        dataIndex: 'tableNameZh',
        key: 'tableNameZh',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#f9fafb',
                    padding: '5px',
                    color: '#6b7280',
                }
            };
        },
        scopedSlots: { customRender: 'tableNameZh' },
    },
    {
        width: 100,
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        customHeaderCell: () => {
            return {
                style: {
                    backgroundColor: '#f9fafb',
                    padding: '5px',
                    color: '#6b7280',
                }
            };
        },
        scopedSlots: { customRender: 'status' },
    },
]