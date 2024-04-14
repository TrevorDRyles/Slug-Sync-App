# Slug Sync

https://gitlab.com/trevorryles02/slug-sync

In order for the application to run correctly, you need to add 3 additional password files to the application. The files have been pinned to the discord channel and contain instruction for how to add them to this application. The reason for this is so we don't store them on gitlab.

## To install node packages:

$ `npm install`

$ `cd backend`

$ `npm install`

$ `cd ../frontend`

$ `npm install`

$ `cd ..`

## To start the database:

Install Docker Desktop:
https://www.docker.com/products/docker-desktop/
Then boot up docker desktop

 $ `cd backend`

 $ `docker-compose up -d`

 $ `cd ..`

## To stop the development database:

$ `cd backend`

$ `docker-compose down`

$ `cd ..`

## Resetting Docker

If you run into problems with your dev database, or simply want to re-set it to its initial state, issue the following
commands to shut docker down:

$ `docker stop $(docker ps -aq)`

$ `docker rm $(docker ps -aq)`

Then restart the development database:

$ `docker-compose up -d`

## To run the backend server:
(Inside backend folder)

  $ `npm start`

## To start the frontend application, run the following command:
(Inside frontend folder)

  $ `npm run dev`

## To execute tests run the following command:
(Inside backend, frontend, or e2e folder)

  $ `npm test`

## Linter
A linter is a tool to assert your code meets a formatting standard. You will need to fix lint errors in order to run code a lot of the time.
To run the linter, run

$ `npm run lint`

## Hot reload
Vite hot reload plugin is enabled, meaning you can make a code change and type 
`ctrl + s` to reload the server and code changes without reloading the page

## Citations
Please cite chat gpt, code libraries, and online resources if you're copying a lot of code, so we don't get in trouble

## UI Libraries
https://ui.mantine.dev/#main
