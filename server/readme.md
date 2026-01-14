const technician = require("./server/models/technician")

User Schmea(Technician.js)
- has two-role system -> Employee and technician (default: employee)
- 'name', 'unique email', 'password'
- avatar
- accessed via _id

Teams schema(Team.js)
- 'unique name', 'specizialization'
- members -> arrat of objectIds linking to Technician
- used by equipment

Equipment schema(equipment.js) 
- details about the equipment -> name, serial number, location, category and dept., lifecycle( like status, purchaseDate, warrantyExpiry)

Requests Schema (request.js)
- subject, description, priority
- linked to all three of other schema 
- dates -> scheduleddate, compeletedDate
- accessed via '_id'
