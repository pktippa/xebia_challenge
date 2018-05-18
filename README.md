# Xebia Challenge

## Getting Started

```sh
$ npm install
$ node seed.js
$ node .
```

## Back-end Assignment (Javascript)

1. Write a script to create and seed a database to store information about 100 random books.
(You can use the open library API to source data and plan the schema to suit the application).

2. Create a simple form (UI can be trivial) and required endpoints using NodeJS (Express/HAPI) to
perform search on this database and return data related to book(s) which match the criteria,
including all book information and a URL pointing to the book cover, if any. Use a boolean
isCoverAvailable to indicate whether a cover image is available or not.
User should be able to search by author, ISBN, book title and genre.

3. Create endpoints required for a simple auth. mechanism to sign-up, and sign-in users. Users
can be granted privileges out of: Readers or Editors. [Again, care for aesthetics in the UI is not
needed.]

4. Finally, create an endpoint for Editors to add new books to the database. This should also
involve the ability to upload book covers as PNG or JPG images. You're free to choose your own
solution for linking the uploaded images to the corresponding book records for subsequent
searches. Perform suitable validation for the data before storing it to the DB. This endpoint
should only respond if the user making the request has Editor privileges. Once successfully
added, the new book should appear in subsequent searches (whenever there is a match).
Please add adequate unit tests.


Advanced (Bonus points): Implement a caching mechanism (use Redis or any alternative that
you are familiar with) to find out which are the most searched books during a particular week, and
cache the responses for the 5 most searched books (to avoid DB roundtrips) for these for each
subsequent week. This list should refresh itself every Monday.