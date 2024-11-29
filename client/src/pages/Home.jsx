// eslint-disable-next-line no-unused-vars
import React from 'react'
import banner from '../assets/banner.jpg'
import bannerMobile from '../assets/banner-mobile.jpg'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import { useNavigate} from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import { BarChart } from '@mui/x-charts/BarChart';

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const counts = useSelector(state => state.orders.count)
  const orders = useSelector(state => state.orders.order)
  const navigate = useNavigate()

  const handleRedirectProductListpage = (id,cat)=>{
      console.log(id,cat)
      const subcategory = subCategoryData.find(sub =>{
        const filterData = sub.category.some(c => {
          return c._id == id
        })

        return filterData ? true : null
      })
      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`

      navigate(url)
      console.log(url)
  }


  return (
   <section className='bg-white'>
      <div className='container mx-auto'>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-gray-200 p-2 shadow-sm">
        <div className="flex p-4">
         
          <h3 className="ml-2 text-sm font-medium">Order Show</h3>
        </div>
        <p
          className={`
            truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
        >
          {subCategoryData.length}
        </p>
      </div>
      {counts.map((order,index)=>{
            return(
      <div key={index+'orders'} className="rounded-xl bg-gray-200 p-2 shadow-sm">
        <div className="flex p-4">
         
          <h3 className="ml-2 text-sm font-medium">Total All</h3>
        </div>
        <p
          className={`
            truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
        >
          {order?.total}
        </p>
      </div>
 )
})
}
      <div className="rounded-xl bg-gray-200 p-2 shadow-sm">
        <div className="flex p-4">
         
          <h3 className="ml-2 text-sm font-medium">Company </h3>
        </div>
        <p
          className={`
            truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
        >
          {categoryData.length}
        </p>
      </div>
      <div className="rounded-xl bg-gray-200 p-2 shadow-sm">
        <div className="flex p-4">
         
          <h3 className="ml-2 text-sm font-medium">Total Order </h3>
        </div>
        <p
          className={`
            truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
        >
          {orders.length}
        </p>
      </div>
      </div>
          <div className={`w-full h-full min-h-48 bg-blue-100 rounded ${!banner && "animate-pulse my-2" } `}>
              {/* <img
                src={banner}
                className='w-full h-full hidden lg:block'
                alt='banner' 
              />
              <img
                src={bannerMobile}
                className='w-full h-full lg:hidden'
                alt='banner' 
              /> */}
              <BarChart
      series={[
        { data: [2, 2, 8] },
       
      ]}
      height={290}
      xAxis={[{ data: ['Order Show', 'Company', 'Total Order'], scaleType: 'band' }]}
      margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
    />
          </div>
      </div>
      
      <div className='container mx-auto px-4 my-2 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10  gap-2'>
          {
            loadingCategory ? (
              new Array(12).fill(null).map((c,index)=>{
                return(
                  <div key={index+"loadingcategory"} className='bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse'>
                    <div className='bg-blue-100 min-h-24 rounded'></div>
                    <div className='bg-blue-100 h-8 rounded'></div>
                  </div>
                )
              })
            ) : (
              categoryData.map((cat)=>{
                return(
                  <div key={cat._id+"displayCategory"} className='w-full h-full' onClick={()=>handleRedirectProductListpage(cat._id,cat.name)}>
                    <div>
                        <img 
                          src={cat.image}
                          className='w-full h-full object-scale-down'
                        />
                    </div>
                  </div>
                )
              })
              
            )
          }
      </div>

      {/***display category product */}
      {
        categoryData?.map((c)=>{
          return(
            <CategoryWiseProductDisplay 
              key={c?._id+"CategorywiseProduct"} 
              id={c?._id} 
              name={c?.name}
            />
          )
        })
      }



   </section>
  )
}

export default Home
