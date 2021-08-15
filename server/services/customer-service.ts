import { Postgres } from './postgres'
import { v4 as uuidv4 } from 'uuid';
import * as passwordHash from 'password-hash'
export class CustomerService{
    postgres: Postgres
    constructor(){
        this.postgres = new Postgres()
    }
    async createCustomer(name: string, email: string, password: string){
        const id = uuidv4()
        const hashedPassword = passwordHash.generate(password)
        const query = 'insert into identity.customer(id, name, email, password) VALUES ($1, $2, $3, $4)'
        await this.postgres.query(query, [id, name, email, hashedPassword])
        return id
    }

    async deleteCustomer(id: string){
        const query = 'delete from identity.customer where id=$1'
        await this.deleteCustomerCertificates(id)
        await this.postgres.query(query, [id])
        return
    }

    private async deleteCustomerCertificates(customerId: string){
        const query = 'delete from ledger.certificate where customer_id=$1'
        await this.postgres.query(query, [customerId])
        return
    }

    async getCustomers(){
        const query = 'select id, name, email from identity.customer'
        const result = await this.postgres.query(query)
        return result.data
    }

    async getCustomerById(id: string){
        const query = 'select * from identity.customer where id=$1'
        const result = await this.postgres.query(query, [id])
        return result.data[0]
    }
}