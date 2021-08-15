import { Postgres } from './postgres'
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import openssl from 'openssl-nodejs' 
import fetch from 'node-fetch'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config()
export class CertificateService{
    postgres: Postgres
    constructor(){
        this.postgres = new Postgres()
    }
    async createCertificate(customerId: string, active: boolean, domainName: string){
        const id = uuidv4()
        await this.addCertificateEntry(id, customerId, active)
        await this.addCertificate(id, domainName, this)
        return id
    }

    private async addCertificateEntry(id: string, customerId: string, active: boolean){
        await this.postgres.query('insert into ledger.certificate(id, customer_id, active) values($1,$2,$3)', 
        [id, customerId, active])
        return
    }

    private async addCertificate(certificateId: string, domainName: string, ref: CertificateService){
        const conf = Buffer.from(`
        [req]
        default_bits = 2048
        distinguished_name = dn
        prompt             = no
        [dn]
        CN=${domainName}
        `)
        openssl(['req', '-config', {name: `${certificateId}.conf`, buffer: conf}, '-nodes', '-new', '-x509', '-keyout', `${certificateId}.key`, '-out', `${certificateId}.cert`], 
        function () {
            fs.readFile(`./openssl/${certificateId}.key`, 'utf8', async (err, data)=>{
                if(err)
                    throw new Error('cannot read private key')
                else{
                    await ref.postgres.query('update ledger.certificate set private_key=$1 where id=$2 ', [data, certificateId])
                }
            } )
            fs.readFile(`./openssl/${certificateId}.cert`, 'utf8', async (err, data)=>{
                if(err)
                    throw new Error('cannot read certificate')
                else{
                    await ref.postgres.query('update ledger.certificate set cert_body=$1 where id=$2 ', [data, certificateId])
                }
            })
            fs.unlinkSync(`./openssl/${certificateId}.conf`)
            fs.unlinkSync(`./openssl/${certificateId}.key`)
            fs.unlinkSync(`./openssl/${certificateId}.cert`)
        });
    }

    async getActiveCertificates(customerId: string){
        const query = 'select * from ledger.certificate where customer_id=$1 and active=$2'
        const result = await this.postgres.query(query, [customerId, true])
        return result.data
    }

    async getCertificate(id: string){
        const result = await this.postgres.query('select * from ledger.certificate where id=$1', [id])
        return result.data[0]
    }

    async modifyActiveStatus(id: string, active: boolean){
        const query = 'update ledger.certificate set active=$1 where id=$2'
        await this.postgres.query(query, [active, id])
        await this.sendNotification(id, active)
        return
    }

    
    private async sendNotification(certificateId: string, active: boolean){
        const customer = await this.postgres.query(`select ic.id,name, email from identity.customer ic
        join ledger.certificate lc
        on ic.id=lc.customer_id
        where lc.id=$1`, [certificateId])
        const {id,name, email} = customer.data[0]
        const body = {
            certificateId, 
            customerId: id,
            name, 
            email,
            message: `certificate status set to: ${active}`
        }
        try{
            const res = await fetch(process.env.WEBHOOK_URL as string, {
                method: 'POST', 
                body: JSON.stringify(body)
            })
            if (res.ok) {
                const responseBody = await res.json()
                // send this to a queue, logger in prod
                console.log('notification sent successfully', responseBody)
            } else {
                // send this to a queue, logger in prod. 
                console.log('error sending notification', res.statusText)
            }
        }
        catch(err){
            // send this to logger in prod.
            console.log('error sending notification', err.message)
        }
    }
}