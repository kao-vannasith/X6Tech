import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    order : [],
    count : []
}

const orderSlice = createSlice({
    name : 'order',
    initialState : initialValue,
    reducers : {
        setOrder : (state,action)=>{
            state.order = [...action.payload]
        },
        setCount : (state,action)=>{
            state.count = [...action.payload]
        }
    }
})

export const {setOrder, setCount } = orderSlice.actions

export default orderSlice.reducer