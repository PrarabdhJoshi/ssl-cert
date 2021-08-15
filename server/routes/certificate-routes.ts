import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import * as Koa from 'koa'
import { CertificateService } from '../services/certificate-service';
import { CustomerService } from '../services/customer-service';

export const certificateRouter = new Router()
certificateRouter.use(bodyParser())
const certificateService = new CertificateService()
const customerService = new CustomerService()

certificateRouter.get('/customer/:customerId/active-certificates', async (ctx: Koa.Context)=>{
    try{
        const customer = await customerService.getCustomerById(ctx.params.customerId)
        if(!customer){
            ctx.body = {
                status: 404, 
                error: `customer with id: ${ctx.params.customerId} does not exist`
            }
            return
        }
        const data = await certificateService.getActiveCertificates(ctx.params.customerId)
        if(data.length===0){
            ctx.body = {
                status: 404, 
                error: 'no active certificates exist for the customer.'
            }
            return
        }
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

certificateRouter.patch('/certificate/:id', async(ctx: Koa.Context)=>{
    const body = ctx.request.body
    if(body.active===undefined){
        ctx.body = {
            status: 403, 
            error: 'malformed request. Please provide active field in the body'
        }
        return
    }
    try{
        const certificate = await certificateService.getCertificate(ctx.params.id)
        if(!certificate){
            ctx.body = {
                status: 404, 
                error: `certificate with id: ${ctx.params.id} does not exist`
            }
            return
        }
        await certificateService.modifyActiveStatus(ctx.params.id, body.active)
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

certificateRouter.post('/certificate', async(ctx: Koa.Context)=>{
    const body = ctx.request.body
    console.log('body', !body.customerId, body.active, !body.domainName)
    if(!body.customerId || body.active===undefined || !body.domainName){
        ctx.status = 403
        ctx.body = {
            status: 403,
            error: 'malformed request. Please provide customer id, active and domainName field'
        } 
    }else{
        try{
            const customer = await customerService.getCustomerById(body.customerId)
            if(!customer){
                ctx.body = {
                    status: 404, 
                    error: `customer with id: ${ctx.params.customerId} does not exist`
                }
                return
            }
            const id = await certificateService.createCertificate(body.customerId, body.active, body.domainName)
            ctx.body = {
                status: 201,
                message: `certificate successfully created with id: ${id}`
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







