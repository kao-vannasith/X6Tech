import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs';
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'
import { IoSearchOutline } from "react-icons/io5";
import isAdmin from '../utils/isAdmin'
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const MyOrders = () => {
  //const orders = useSelector(state => state.orders.order)
  const user = useSelector((state) => state.user)
  const [valueStart, setValueStart] = useState(dayjs().startOf('day'));
  const [valueEnd, setValueEnd] = useState(dayjs().endOf('day'));
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const statusOptions = ['ตีกลับ', 'รอดำเนินการ', 'จัดส่งแล้ว', 'เก็บปายทาง'];

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      await Axios({
        ...SummaryApi.getOrderExcel,
      })
    } catch (error) {
      AxiosToastError(error)
    }
  }

  const fetchCategory = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getOrderItems,
        params: {
          startDate: valueStart.toISOString(),
          endDate: valueEnd.toISOString(),
          status: status
        }
      })
      const { data: responseData } = response

      if (responseData.success) {
        setOrders(responseData.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategory()
  }, [valueStart, valueEnd, status]) 

  return (
    <div>
      <div className='p-2 bg-white shadow-md flex items-center justify-between gap-4'>
        <h1 className='font-semibold'>Order</h1>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoContainer components={['DatePicker', 'DatePicker']}>
            <DatePicker
              label="Start Date"
              value={valueStart}
              onChange={(newValue) => setValueStart(newValue)}
            />
            <DatePicker
              label="End Date"
              value={valueEnd}
              onChange={(newValue) => setValueEnd(newValue)}
            />
          </DemoContainer>
        </LocalizationProvider>
        <select value={status} onChange={handleStatusChange}>
        <option value="ALL">Show</option>
                  <option value="รอการดำเนินการ">รอการดำเนินการ</option>
                  <option value="จัดส่งแล้ว">จัดส่งแล้ว</option>
                  <option value="เก็บเงินแล้ว">เก็บเงินแล้ว</option>
                  <option value="เก็บปายทาง">เก็บปายทาง</option>
                  <option value="ตีกลับ">ตีกลับ</option>
                </select>
        <button onClick={handleSubmit} className='font-semibold text-green-700 hover:text-green-800'>
          Export Excel
        </button>
        
        <div className='h-full min-w-24 max-w-56 w-full ml-auto bg-blue-50 px-4 flex items-center gap-3 py-2 rounded border focus-within:border-primary-200'>
          <IoSearchOutline size={25} />
          <input
            type='text'
            placeholder='Search Order here...'
            className='h-full w-full outline-none bg-transparent'
          />
        </div>
      </div>

      {!orders.length && !loading && (
        <NoData />
      )}

      {orders.map((order, index) => (
        <div key={`${order._id}-${index}`} className='order rounded p-4 text-sm'>
          <p>Order No: {order?.orderId}</p>
          <div className='flex gap-3'>
            <img
              src={order.product_details.image[0]}
              alt="Product"
              className='w-20 h-34'
            />
            <div>
              <p className='font-medium'>จาก: {order.userId.name}</p>
              <p className='font-medium'>สินค้า: {order.product_details.name}</p>
              <p className='font-medium'>ขนส่ง: {order.delivery_address?.address_line}</p>
              <p className='font-medium'>
                สถานะ:
                <select>
                  <option>{order.payment_status}</option>
                  <option>รอการดำเนินการ</option>
                  <option>จัดส่งแล้ว</option>
                  <option>เก็บเงินแล้ว</option>
                </select>
                {isAdmin(user.role) && (
                  <button className='font-semibold text-green-700 hover:text-green-800'>แก้ไข</button>
                )}
              </p>
              <p className='font-medium'>จำนวน: {order.subTotalAmt}</p>
              <p className='font-medium'>ราคา: {order.totalAmt}</p>
              <p className='font-medium'>รหัสไปรษณีย์: {order.delivery_address?.pincode}</p>
              <p className='font-medium'>เบอร์โทร: {order.delivery_address?.mobile}</p>
              <p className='font-medium'>
                วันที่: {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MyOrders
