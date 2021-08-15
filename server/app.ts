import koa from 'koa'
import { certificateRouter } from './routes/certificate-routes'
import {customerRouter} from './routes/customer-routes'

const app  = new koa()
app.use(customerRouter.routes())
app.use(certificateRouter.routes())
const port = 9008

app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
})