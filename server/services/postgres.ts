
import {Pool} from 'pg'
import * as dotenv from 'dotenv'
dotenv.config()


export class Postgres{
    private _client: any
    private get client(): Pool {
        if (!this._client) {
            this._client = new Pool({
                user: process.env.DB_USER,
                host: process.env.HOST,
                database: process.env.DATABASE,
                password: process.env.PASSWORD,
                port: parseInt(process.env.PORT as any),
            })
        }
        return this._client
    }
    async query(query: string, values: any[] | null = null): Promise<{data: any[]}> {
        let pgQuery: any = {
            text: query,
            values: values ? values : null,
        }
        return new Promise((resolve, reject) => {
            return this.client.connect((err, client, release) => {
                if (err) {
                    reject(err)
                } else {
                    client.query(pgQuery, (err: any, res: any) => {
                        release()
                        if (err) {
                            reject(err)
                        } else {
                            resolve({data: res.rows})
                        }
                    })
                }
            })
        })
    }
}