'use client'

import * as React from "react";
import "@mescius/wijmo.styles/wijmo.css";
import * as WjCore from "@mescius/wijmo";
import * as WjGrid from '@mescius/wijmo.react.grid'
import "@mescius/wijmo.cultures/wijmo.culture.ja";
import { getOrder, addOrder, deleteOrder, updateOrder } from '../app/actions'

type OrderItem = {
    id?: number;
    product: string;
    price: number;
    quantity: number;
    orderdate: Date;
};

const FlexGrid = () => {
    // CollectionViewを状態として管理
    const [collectionView, setCollectionView] = React.useState<WjCore.CollectionView<OrderItem> | null>(null);
    
    React.useEffect(() => {
        // コンポーネントのロード時にデータをフェッチ
        getOrder().then(data => {
            const cv = new WjCore.CollectionView(data as OrderItem[], {
                trackChanges: true, // 変更追跡を有効にする
                pageSize: 15,
            });
            setCollectionView(cv);
        });
    }, []);

    const update = async () => {
        if (!collectionView) {
            return;
        }

        try {
            // 新規追加された項目を抽出して処理
            const addedItems = collectionView.itemsAdded
                .map(item => ({
                    product: item.product,
                    price: item.price,
                    quantity: item.quantity,
                    orderdate: item.orderdate instanceof Date ? item.orderdate.toISOString() : item.orderdate
            }));
            
            if (addedItems.length > 0) {
                await addOrder(addedItems);
            }
            
            // 編集された項目を抽出して処理
            const updatedItems = collectionView.itemsEdited
                .filter(item => typeof item.id === 'number')
                .map(item => ({
                    id: item.id as number,
                    product: item.product,
                    price: item.price,
                    quantity: item.quantity,
                    orderdate: item.orderdate instanceof Date ? item.orderdate.toISOString() : item.orderdate
                }));

            if (updatedItems.length > 0) {
                await updateOrder(updatedItems);
            }

            // 削除された項目のIDを抽出して処理
            const removedIds = collectionView.itemsRemoved
                .filter(item => typeof item.id === 'number')
                .map(item => item.id as number);

            if (removedIds.length > 0) {
                await deleteOrder(removedIds);
            }

            // すべてのサーバー処理が成功した後に変更履歴をクリア
            collectionView.clearChanges();
            
            alert('変更が正常に保存されました。');

        } catch (error) {
            console.error("データの更新中にエラーが発生しました:", error);
            alert('データの保存に失敗しました。');
        }
    };

    return (
        <div className="p-4">
            <button
                onClick={update}
                className={`inline-flex h-12 items-center justify-center rounded-md bg-blue-500 py-2 px-6 mb-2 font-medium text-neutral-50 shadow-lg shadow-neutral-500/20 transition active:scale-95`}
            >
                更新
            </button>
            <div className="w-full max-w-4xl">
                {collectionView && (
                    <WjGrid.FlexGrid
                        itemsSource={collectionView}
                        allowAddNew={true}
                        allowDelete={true}
                        style={{ width: '100%', minHeight: '400px' }}
                    >
                        <WjGrid.FlexGridColumn header="ID" binding="id" width={80} isReadOnly={true} />
                        <WjGrid.FlexGridColumn header="製品名" binding="product" width={200} />
                        <WjGrid.FlexGridColumn header="単価" binding="price" width={100} />
                        <WjGrid.FlexGridColumn header="数量" binding="quantity" width={100} />
                        <WjGrid.FlexGridColumn header="受注日" binding="orderdate" width={150} />
                    </WjGrid.FlexGrid>
                )}
            </div>
        </div>
    );
}

export default FlexGrid;
