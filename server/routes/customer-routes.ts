import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import * as Koa from 'koa'
import { CustomerService } from '../services/customer-service';

export const customerRouter = new Router()
customerRouter.use(bodyParser())
const customerService = new CustomerService()

customerRouter.get('/customer', async (ctx: Koa.Context)=>{
    try{
        const data = await customerService.getCustomers()
        ctx.body = {
            status: 200,
            data 
        }
    }
    catch(e){
        ctx.body = {
            status: 500, 
            error: e.message
        }
    }
})

customerRouter.post('/customer', async(ctx: Koa.Context)=>{
    const body = ctx.request.body
    if(!body.name || !body.password || !body.email){
        ctx.status = 400
        ctx.body = {
            status: 400,
            error: 'malformed request. Please provide all name, password and email in the body'
        } 
    }else{
        try{
            const id = await customerService.createCustomer(body.name, body.email, body.password)
            ctx.body = {
                status: 201,
                message: `user successfully created with id: ${id}`
            }
        }
        catch(e){
            ctx.body = {
                status: 500, 
                error: e.message
            }
        }
    }
})

customerRouter.delete('/customer/:id', async(ctx: Koa.Context)=>{
    try{
        const existingCustomer = await customerService.getCustomerById(ctx.params.id)
        if(!existingCustomer){
            ctx.body = {
                status: 404, 
                error: `customer with id: ${ctx.params.id} does not exist`
            }
            return
        }
        await customerService.deleteCustomer(ctx.params.id)
        ctx.body = {
            status: 204,
            data: null
        }
    }
    catch(e){
        ctx.body = {
            status: 500,
            error: e.message
        }
    }
})

customerRouter.get('/customer/:id', async(ctx: Koa.Context)=>{
    try{
        const data = await customerService.getCustomerById(ctx.params.id)
        if(!data){
            ctx.body = {
                status: 404, 
                error: `customer with id: ${ctx.params.id} does not exist`
            }
        }
        else{
            ctx.body = {
                status: 200, 
                data
            }
        }
    }
    catch(e){
        ctx.body = {
            status: 500, 
            error: e.message
        }
    }
})




