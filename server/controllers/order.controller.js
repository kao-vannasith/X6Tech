import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

 export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "",
                payment_status : "เก็บปายทาง",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}

export async function paymentController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const user = await UserModel.findById(userId)

        const line_items  = list_items.map(item =>{
            return{
               price_data : {
                    currency : 'inr',
                    product_data : {
                        name : item.productId.name,
                        images : item.productId.image,
                        metadata : {
                            productId : item.productId._id
                        }
                    },
                    unit_amount : pricewithDiscount(item.productId.price,item.productId.discount) * 100   
               },
               adjustable_quantity : {
                    enabled : true,
                    minimum : 1
               },
               quantity : item.quantity 
            }
        })

        const params = {
            submit_type : 'pay',
            mode : 'payment',
            payment_method_types : ['card'],
            customer_email : user.email,
            metadata : {
                userId : userId,
                addressId : addressId
            },
            line_items : line_items,
            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`

        }

        const session = await Stripe.checkout.sessions.create(params)

        return response.status(200).json(session)

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
 })=>{
    const productList = []

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)

            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId, 
                product_details : {
                    name : product.name,
                    image : product.images
                } ,
                paymentId : paymentId,
                payment_status : payment_status,
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_total / 100),
                totalAmt  :  Number(item.amount_total / 100),
            }

            productList.push(paylod)
        }
    }

    return productList
}

//http://localhost:8080/api/order/webhook
export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    //.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : session.payment_status,
        })
    
      const order = await OrderModel.insertMany(orderProduct)

        //.log(order)
        if(Boolean(order[0])){
            const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
        }
      break;
    default:
      //.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}


export async function getOrderDetailsController(request,response){
    try {
        
        const userId = request.userId // order id
        const user = await UserModel.findById(userId)
        //console.log(request.userId)
        // let { search } = request.body
        // const query = search ? {
        //     $text : {
        //         $search : search
        //     }
        // } : {}
        if(user.role === 'ADMIN'){
            const orderlist = await OrderModel.find().sort({ createdAt : -1 }).populate(['delivery_address','userId'])
        const count = await OrderModel.aggregate([
            {  $group: { 
                _id: null, 
                total: { 
                    $sum: "$totalAmt" 
                } 
            }  }
          ]);
          return response.json({
            message : "order list",
            data : orderlist,
            totalAll : count,
            error : false,
            success : true
        })
        } else {
            const ObjectId = mongoose.Types.ObjectId;
            const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate(['delivery_address','userId'])
        const count = await OrderModel.aggregate([
            {
                $match: { userId: new ObjectId(userId) }
              },
            {  $group: { 
                _id: { userId : userId },
                total: { 
                    $sum: "$totalAmt" 
                } 
            }  }
          ]);
          return response.json({
            message : "order list",
            data : orderlist,
            totalAll : count,
            error : false,
            success : true
        })
        }
        
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

import excelJS from 'exceljs';
import path from 'path'
import os from 'os'; // Add the os module


export async function exportOrder(request, response) {
    try {
        const orderlist = await OrderModel.find().sort({ createdAt: -1 }).populate(['delivery_address', 'userId']);
        const workbook = new excelJS.Workbook();  // Create a new workbook
        const worksheet = workbook.addWorksheet("My Order"); // New Worksheet
        // Column for data in excel. key must match data key
        worksheet.columns = [
            { header: "O no.", key: "o_no", width: 10 },
            { header: "จาก", key: "userId", width: 10 },
            { header: "สินค้า", key: "product_details", width: 10 },
            { header: "จำนวน", key: "subTotalAmt", width: 10 },
            { header: "ราคา", key: "totalAmt", width: 10 },
        ];

        // Looping through User data
        let counter = 1;
        orderlist.forEach((order) => {
            order.o_no = counter;
            worksheet.addRow(order); // Add data in worksheet
            counter++;
        });

        // Making first line in excel bold
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });

        // Use os module to get the user's home directory
        const homeDir = os.homedir();
        const filePath = path.join(homeDir, 'Downloads', 'orders.xlsx');

        // Write the workbook to the file
        await workbook.xlsx.writeFile(filePath)
            .then(() => {
                response.send({
                    status: "success",
                    message: "File successfully downloaded",
                    path: filePath,
                });
            });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
