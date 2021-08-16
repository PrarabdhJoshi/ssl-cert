# CloudFlare Programming Exercise
## Prarabdh Joshi

HTTP-based RESTful API for managing Customers and their Certificates.

> ### Customer
    - Has a name
    - Has an email address
    - Has a password
    - May have zero to many Certificates
    
> ### Certificate
    - Belongs to one and only one Customer
    - Can be either active or inactive 
    - Has a private key
    - Has a certificate body

## Features

- Creating/Deleting Customers
- Viewing all Customers
- Viewing Customer by Id
- Creating Certificates
- Listing all of user's active certificates
- Activating/Deactivating Certificates
- Notify an external system when activation/deactivation occurs
- Data persistence through postgresSQL

## Tech

- Node JS
- Koa
- Typescript
- Postgres
- Openssl
- Docker
- password-hash

## Installation

> Caution: </br>Update WEBHOOK_URL in .env to receive activation/deactivation notifications. </br></br>
> Port Assumption: </br> 9008 is assumed to be available for hosting server. If its not, update it in the app.ts file. </br> 5433 is assumed to be available for hosting DB. If not, update it in the docker-compose and the .env file. 

Pre-requisites: [Node.js](https://nodejs.org/) v12+, docker >=20.10.0, npm >= 6.14.8

Install the dependencies and devDependencies and start the server.

```sh
cd ssl-cert
npm install
npm run run-app
```

## API Documentation

#### <u><b> Create new customer </b></u>
    - POST: ${baseUrl}/customer
    - body: {
            name: string //required
            password: string //required
            email: string // required
        }
    - response: {
        status: [201, 400, 500]
        message/error: string
    }

##### Example (201): 
>   </br><b>Request:</b> </br>
    curl --header "Content-Type: application/json" -d '{\"name\":\"test-user\", \"email\": \"testing@test.com\", \"password\":\"pass\"}' http://localhost:9008/customer </br></br>
    <b>Response:</b> </br>
    ```
    {"status":201,"message":"user successfully created with id: 7193f400-7f01-4d40-b30d-f67207860d33"}
    ```</br></br>
    
##### Example (400): 
> </br><b>Request:</b> </br> 
    curl --header "Content-Type: application/json" -d "{}" http://localhost:9008/customer </br></br>
    <b>Response:</b> </br>
    ```{"status":400,"error":"malformed request. Please provide all name, password and email in the body"}```</br></br>

#### <u><b>View customer by id </b> </u>
    - GET: ${baseUrl}/customer/:id
    - response: {
        status: [200, 404, 500]
        data: object
    }
##### Example (200): 
> </br><b>Request:</b> </br> 
    curl http://localhost:9008/customer/7193f400-7f01-4d40-b30d-f67207860d33 </br></br>
    <b>Response: </b>  </br>
    ```{status:200, data:[{"id":"7193f400-7f01-4d40-b30d-f67207860d33", name:"test-user", email: "testing@test.com"}]}```</br></br>

##### Example (404): 
> </br><b>Request:</b> </br> 
    curl http://localhost:9008/customer/non-existing </br></br>
    <b>Response:</b> </br>
    ```{"status":404,"error":"customer with id: non-existing does not exist"}```</br></br>
    
#### <u><b> View existing Customers </u></b>
    - GET: ${baseUrl}/customer
    - response: {
        status: [200, 500]
        data: object | error: string
    }
##### Example: 
> </br><b>Request:</b> </br> 
    curl http://localhost:9008/customer </br></br>
    <b>Response:</b> </br>
    ```{"status":200,"data":[{"id":"7193f400-7f01-4d40-b30d-f67207860d33","name":"test-user","email":"testing@test.com"}]}```</br></br>
    
#### <u><b> Delete existing Customer </b></u>
    - DELETE: ${baseUrl}/customer/:id
    - response: {
        status: [204, 404, 500],
        data: null | error: string
    }
##### Example (204): 
> </br><b>Request:</b> </br> 
    curl -X DELETE http://localhost:9008/customer/7193f400-7f01-4d40-b30d-f67207860d33 </br></br>
    <b>Response:</b> </br>
    ```{"status":204,"data":null}```</br></br>

##### Example (404): 
> </br><b>Request:</b> </br> 
    curl -X DELETE http://localhost:9008/customer/non-existent
    </br></br> <b>Response:</b> </br>
    ```{"status":404,"error":"customer with id: non-existent does not exist"}```</br></br>


#### <u><b>Creating new Certificate</b></u>
    - POST: ${baseUrl}/certificate
    - body: {
            customerId: string //required
            active: boolean //required
            domainName: string // required
        }
    - response: {
        status: [201, 400, 404, 500],
        message/error: string
    }
##### Example (201): 
> </br><b>Request:</b> </br> 
    curl --header "Content-Type: application/json" -d '{\"customerId\":\"40802f0d-d030-40f4-8572-a2e18372d161\", \"active\": false, \"domainName\":\"www.test.com\"}' http://localhost:9008/certificate </br> </br>
    <b>Response:</b> </br> 
    ```{"status":201,"message":"certificate successfully created with id: fcf4ec54-cfdb-477b-ba73-03c29af6320f"}```  </br> </br>

##### Example (404): 
> </br><b>Request:</b> </br> </br>
    curl --header "Content-Type: application/json" -d "{\"customerId\":\"non-existent\", \"active\": false, \"domainName\":\"www.test.com\"}" http://localhost:9008/certificate </br> </br>
    <b>Response:</b> </br></br>
    ```{"status":404,"error":"customer with id: non-existent does not exist"}```
    </br></br>

##### Example (400): 
> </br><b>Request:</b> </br> 
    curl --header "Content-Type: application/json" -d "{\"customerId\":\"non-existent\", \"active\": false}" http://localhost:9008/certificate </br></br>
    Response: </br>
    ```{"status":400,"error":"malformed request. Please provide customer id, active and domainName field"}```</br></br>
    
#### <u><b>View Customer's active certificates</b></u>
    - GET: ${baseUrl}/customer/:id/active-certificates
    - response: {
        status: [200, 404, 500]
        data: object | error: string
    }

##### Example (200): 
> </br><b>Request:</b></br>
    curl http://localhost:9008/customer/40802f0d-d030-40f4-8572-a2e18372d161/active-certificates </br></br>
    <b>Response:</b><br>
    ```{"status":200,"data":[{"id":"38b67343-920e-4c3d-8b11-098b65451b69","cert_body":"-----BEGIN CERTIFICATE-----\nMIICqjCCAZICCQDtbNAjgsafJjANBgkqhkiG9w0BAQsFADAXMRUwEwYDVQQDDAx3\nd3cudGVzdC5jb20wHhcNMjEwODE1MDgxMzU2WhcNMjEwOTE0MDgxMzU2WjAXMRUw\nEwYDVQQDDAx3d3cudGVzdC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK\nAoIBAQDNKMSI17rcwh3EmdNO+5aQp8ZOuTum6OfmMks6vuDmZ3E2qxMcWNKfQvOc\ngybobDGD4gq/XKmB+BpEGJGsPYCs9VLVbtau2yXZOSkbYpZ456UeqVXjlM2BHTNG\nfQnu2WqHF88NFquxI76J3jD1zjGIQjL7pUa9mdKuMr0vZqUG35hUUpRojSr4u/Jj\nmciZBXxDCdjZjghhZZ6TfLW7fVS6r0mIEFOREFljrrLDfyImIiu0Kj7PzksFnvfB\nHWG+aI1DyIz5EzSmnGMOM6m5vME3IC1Ic6RlcpqnTm79cOeFNMg4xbZqi7xoA8rr\ngFLKC9viCgFoOVKR0GbbHc2poQkVAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAEgH\n5pBmv4mcxmnm6xqsqPVjVT8fdoJF1uJx/B8NvnUJiN2APNegI8De3/R+JvbfcYDg\nSAZ8xHTC7Ui2xKIF7JLnhUzIvCGDikCkoSLYVBhhbXSMeuNTgXN9E014WERoTejq\nQdCGFPbrUGPCJS5TO9bQVZ2OiJBMPG+YVnpzNmaqX770b5QlruE9GbC/omyXVXB5\nG1v4qcUIVfsd8Czl+TYjnyKswGd2pvF+OYHXdUSr7QC3xvWB7UK6c101qiNS9kPF\nbvghQWof5NAeNlbGZa0xlfEyMhbW3fha8CImS53XqaY5xYhLU+vLFMR92O0y8elN\nXdFe6cnrhU4ZstN4FCw=\n-----END CERTIFICATE-----\n","customer_id":"40802f0d-d030-40f4-8572-a2e18372d161"}]}``` </br></br>
    
##### Example (404, no active Certificate(s)): 
> </br><b>Request:</b> </br> 
    curl http://localhost:9008/customer/5ea2c6f2-f737-4730-8b0d-ff971f2690f8/active-certificates </br></br>
    <b>Response:</b> </br>
    ```{"status":404,"error":"no active certificates exist for the customer."}``` </br></br>
##### Example (404, non-existent customer): 
> </br><b>Request:</b> </br> 
    curl http://localhost:9008/customer/non-existent/active-certificates </br></br>
    <b>Response:</b> </br>
    ```{"status":404,"error":"customer with id: non-existent does not exist"}``` </br></br>
    
#### <u><b>Activate/DeActivate Certificate</b></u>
    - PATCH: ${baseUrl}/certificate/:certificateId
    - body: { active: boolean }
    - response: {
        status: [204, 400, 404, 500]
        data: object | error: string
    }
    
##### Example (204): 
> </br><b>Request:</b> </br> 
    curl -X PATCH -H "Content-Type: application/json" -d '{"active": false}' http://localhost:9008/certificate/fcf4ec54-cfdb-477b-ba73-03c29af6320f/ </br></br>
    <b>Response:</b> </br>
    ```{"status":204,"data":null}``` </br></br>
    
##### Example (404, non-existent Certificate): 
> </br><b>Request:</b> </br> 
    curl -X PATCH -H "Content-Type: application/json" \
    -d '{"active": false}' \
     http://localhost:9008/certificate/non-existent/ </br></br>
    </b>Response:</b> </br>
    ```{"status":404,"error":"certificate with id: non-existent does not exist"}``` </br></br>

##### Example (400, malformed request): 
> </br><b>Request:</b> </br>
    curl -X PATCH -H "Content-Type: application/json" \
    -d '{}' \ 
     http://localhost:9008/certificate/non-existent/ </br></br>    <b>Response:</b> </br>
    ```{"status":400,"error":"malformed request. Please provide active field in the body"}``` </br></br>
    
##### Example (sending activation notification): 

![webhook](https://github.com/PrarabdhJoshi/ssl-cert/blob/main/documentation/screenshots/webhook-notification.png?raw=true)


##### DB - Schema
![db-schema](https://github.com/PrarabdhJoshi/ssl-cert/blob/main/documentation/screenshots/db-schema.png?raw=true)



