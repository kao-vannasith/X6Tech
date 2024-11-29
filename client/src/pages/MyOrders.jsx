import React from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'
import { IoSearchOutline } from "react-icons/io5";
import isAdmin from '../utils/isAdmin'

const MyOrders = () => {
  const orders = useSelector(state => state.orders.order)
  const user = useSelector((state)=> state.user)

  console.log("order Items",orders)
  return (
    <div>
      <div className='p-2  bg-white shadow-md flex items-center justify-between gap-4'>
        <h1 className='font-semibold'>Order</h1>
        <button className='font-semibold text-green-700 hover:text-green-800'>Export Excel</button>
        <div className='h-full min-w-24 max-w-56 w-full ml-auto bg-blue-50 px-4 flex items-center gap-3 py-2 rounded  border focus-within:border-primary-200'>
                  <IoSearchOutline size={25}/>
                  <input
                    type='text'
                    placeholder='Search Order here ...' 
                    className='h-full w-full  outline-none bg-transparent'
                    // value={search}
                    // onChange={handleOnChange}
                  />
                </div>
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
                      <p className='font-medium'>จาก: {order.userId.name}</p>
                      <p className='font-medium'>สินค้า: {order.product_details.name}</p>
                      <p className='font-medium'>ขนส่ง: {order.delivery_address?.address_line}</p>
                      <p className='font-medium'>สถานะ: <select name="" id="">
                        <option value={""}>{order.payment_status}</option>
                        <option value={""}>รอถ้าดำเนีนการ</option>
                        <option value={""}>จัดส่งแล้ว</option>
                        <option value={""}>เก็บเงีนแล้ว</option></select>
                        {
                          isAdmin(user.role) && (
                            <button className='font-semibold text-green-700 hover:text-green-800'>แก้ไข</button>
                          )
                        }
                           </p>
                      <p className='font-medium'>จำนวน: {order.subTotalAmt}</p>
                      <p className='font-medium'>ราคา: {order.totalAmt}</p>
                      <p className='font-medium'>Url: {order.delivery_address?.pincode}</p>
                      <p className='font-medium'>เบีโทร: {order.delivery_address?.mobile}</p>
                      <p className='font-medium'>วันที: {order.createdAt}</p>
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
