import React from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'

const MyOrders = () => {
  const orders = useSelector(state => state.orders.order)

  console.log("order Items",orders)
  return (
    <div>
      <div className='bg-white shadow-md p-3 font-semibold'>
        <h1>Order</h1>
      </div>
        {
          !orders[0] && (
            <NoData/>
          )
        }
        {
          orders.map((order,index)=>{
            return(
              <div key={order._id+index+"order"} className='order rounded p-4 text-sm'>
                  <p>Order No : {order?.orderId}</p>
                  <div className='flex gap-3'>
                    <img
                      src={order.product_details.image[0]} 
                      className='w-20 h-34'
                    />  
                    <div>
                      <p className='font-medium'>สินค้า: {order.product_details.name}</p>
                      <p className='font-medium'>ขนส่ง: {order.delivery_address?.address_line}</p>
                      <p className='font-medium'>สถานะ: {order.payment_status}</p>
                      <p className='font-medium'>จำนวน: {order.subTotalAmt}</p>
                      <p className='font-medium'>ราคา: {order.totalAmt}</p>
                      <p className='font-medium'>Url: {order.delivery_address?.pincode}</p>
                      <p className='font-medium'>เบีโทร: {order.delivery_address?.mobile}</p>
                      {/* <p className='font-medium'>{order.delivery_address.city}</p> */}
                    </div>
                    
                  </div>
              </div>
            )
          })
        }
    </div>
  )
}

export default MyOrders
