'use server'

//import { prisma } from '@/prisma'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

// データ取得 (Read)
export async function getOrder() {
  const orders = await prisma.orderData.findMany();
  return orders;
}

export async function updateOrder(changes: { id: number; [key: string]: any }[]) {
  for (const change of changes) {
    const { id, ...data } = change
    await prisma.orderData.update({ where: { id }, data })
  }
}

export async function addOrder(addData: { [key: string]: any }[]) {
  for (const orderData of addData) {
    const { ...data } = orderData
    await prisma.orderData.create(
      {
        data: {
          product: data.product,
          price: data.price,
          quantity: data.quantity,
          orderdate: data.orderdate,
        },
    })
  }
}

export async function deleteOrder(ids: number[]) {
  for (const id of ids) {
    await prisma.orderData.delete({ where: { id } })
  }
}