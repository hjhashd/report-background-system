/*
 * @Author: bekon
 * @Date: 2025-03-23 11:53:48
 * @LastEditors: bekon
 * @LastEditTime: 2025-05-11 09:19:42
 * @FilePath: \report-background-system\src\components\dataGoTable\util.js
 * @Description: 
 * 
 */
export function dealTable(data, isCanEdit = false) {
    let columns = [];

    if (data.length) {
        // 收集所有行中的字段键名，而不仅仅是第一行
        const allKeys = new Set();
        data.forEach(row => {
            Object.keys(row).forEach(key => {
                if (key !== 'id') {
                    allKeys.add(key);
                }
            });
        });

        // 为每个唯一键创建列配置
        allKeys.forEach(key => {
            const columnItem = {
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
            }
            if (isCanEdit) {
                columnItem.scopedSlots = { customRender: key }
            }
            columns.push(columnItem);
        });

        if (isCanEdit) {
            columns.unshift({
                width: '100px',
                title: '操作',
                dataIndex: 'tool',
                key: 'tool',
                scopedSlots: { customRender: 'tool' },
                customHeaderCell: () => {
                    return {
                        style: {
                            backgroundColor: '#EFF6FF',
                            color: '#656D92',
                            padding: '5px'
                        }
                    };
                },
            })
        }
    }
    let reData = data.map((u) => Object.assign(u, { canEdit: false }));


    return { columns, reData }
}