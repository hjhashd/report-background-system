/*
 * @Author: bekon
 * @Date: 2025-03-23 11:53:48
 * @LastEditors: bekon
 * @LastEditTime: 2025-03-23 12:15:00
 * @FilePath: /report-background-system/src/components/dataGoTable/util.js
 * @Description: 
 * 
 */
export function dealTable(data) {
    let columns = [];
    let reData = data;

    if (data.length) {
        const first = data[0]
        for (const key in first) {
            if (Object.prototype.hasOwnProperty.call(first, key)) {
                columns.push(
                    {
                        width: '200px',
                        title: key,
                        dataIndex: key,
                        key: key,
                        customHeaderCell: () => {
                            return {
                                style: {
                                    backgroundColor: '#EFF6FF',
                                    color: '#656D92',
                                    padding: '5px'
                                }
                            };
                        },
                    },
                )
            }
        }
    }

    return { columns, reData }
}