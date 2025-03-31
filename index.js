const express=require('express');
const app=express();

const PORT=3000;

app.use(express.json());


let travelPackages = [
    { packageId: 1, destination: "Paris", price: 1500, duration: 7, availableSlots: 10 },
    { packageId: 2, destination: "Rome", price: 1200, duration: 5, availableSlots: 15 },
    { packageId: 3, destination: "Tokyo", price: 2000, duration: 10, availableSlots: 8 },
    { packageId: 4, destination: "New York", price: 1700, duration: 7, availableSlots: 12 },
    { packageId: 5, destination: "Dubai", price: 1100, duration: 4, availableSlots: 20 },
    { packageId: 6, destination: "Sydney", price: 2500, duration: 12, availableSlots: 5 },
    { packageId: 7, destination: "Cape Town", price: 1800, duration: 8, availableSlots: 6 },
    { packageId: 8, destination: "Bangkok", price: 800, duration: 3, availableSlots: 25 },
    { packageId: 9, destination: "Barcelona", price: 1400, duration: 6, availableSlots: 10 },
    { packageId: 10, destination: "Bali", price: 1300, duration: 5, availableSlots: 15 },
    { packageId: 11, destination: "Istanbul", price: 1000, duration: 4, availableSlots: 18 },
    { packageId: 12, destination: "London", price: 1900, duration: 9, availableSlots: 7 },
    { packageId: 13, destination: "Hawaii", price: 2200, duration: 10, availableSlots: 8 },
    { packageId: 14, destination: "Moscow", price: 1600, duration: 8, availableSlots: 10 },
    { packageId: 15, destination: "Athens", price: 1200, duration: 6, availableSlots: 12 },
  ];
  
  let bookings = [
    { bookingId: 1, packageId: 1, customerName: "Anjali Seth", bookingDate: "2024-12-01", seats: 2 },
    { bookingId: 2, packageId: 5, customerName: "Rahul", bookingDate: "2024-11-20", seats: 3 },
    { bookingId: 3, packageId: 8, customerName: "Kiran Wankhade", bookingDate: "2024-10-15", seats: 1 },
    { bookingId: 4, packageId: 3, customerName: "Robert", bookingDate: "2024-09-10", seats: 4 },
    { bookingId: 5, packageId: 12, customerName: "Aryan Khan", bookingDate: "2024-08-25", seats: 2 },
  ];
 
  function getTravelPackages(){
    return {packages:travelPackages}
  }
  app.get('/packages',(req,res)=>{
    try{
        const result=getTravelPackages();
        if(result.packages.length===0)
             return res.status(404).json({message:"No packages found"});
        return res.status(200).json(result);
    }catch(error){
        return res.status(500).json({error:error.message});
    }
  });

   function getTravelPackageByDestination(destination){
      return {package:travelPackages.find(ele => ele.destination.toLowerCase()===destination.toLowerCase())};
   }
   app.get('/packages/:destination',(req,res)=>{
    try{
        let destination=req.params.destination;
        if(!destination)
          return res.status(400).json({error:"Destination is missing"});   
        let result=getTravelPackageByDestination(destination);
        if(!result.package)
            return res.status(404).json({message:"No package found in this destination"});
        res.status(200).json(result);
    }catch(error){
        return res.status(500).json({error:error.message});
    }
   });

   function validateInputForNewBooking(newBooking){
        const errors=[];
        if(!newBooking.packageId || typeof newBooking.packageId!=='number')
             errors.push('packageId is required and it must be a number');
        if(!newBooking.customerName || typeof newBooking.customerName!='string')
             errors.push('customerName is required and it must be a string');
        if(!newBooking.bookingDate || typeof newBooking.bookingDate!='string')
              errors.push('bookingdate is required and it must be a String');
        if(!newBooking.seats || typeof newBooking.seats!='number')
              errors.push('seat is required and it must be a number');

        return errors;                 
   }

   function addBooking(newBooking){
      bookings.push({
        bookingId:bookings.length+1,
        packageId:newBooking.packageId,
        customerName:newBooking.customerName,
        bookingDate:newBooking.bookingDate,
        seats:newBooking.seats,
      });
      return bookings[bookings.length-1];
   }

   app.post('/bookings',(req,res)=>{
    try{
        let newBooking=req.body;
        let validationErrors=validateInputForNewBooking(newBooking);
        if(validationErrors.length > 0)
             return res.status(400).json({error:validationErrors});
        const result=addBooking(newBooking);
        return res.status(201).json({booking:result});    
    }catch(error){
        return res.status(500).json({error:error.message});
    }
   });

   function validateInput(updatedSeats){
     const errors=[];
     if(!updatedSeats.packageId || typeof updatedSeats.packageId!='number')
         errors.push('packageId is required and It must be a number');
     if(!updatedSeats.seatsBooked || typeof updatedSeats.seatsBooked!='number')
         errors.push('how many seats are booked is required and it must be a string');   

      return errors;
   }

   function updateAvailableSlotsOfPackage(updatedSeats){
       travelPackages.forEach(ele=>{
          if(ele.packageId===updatedSeats.packageId)
              ele.availableSlots=ele.availableSlots-updatedSeats.seatsBooked;
       });
       return {package:travelPackages.find(ele=>ele.packageId===updatedSeats.packageId)};
   }
   app.post('/packages/update-seats',(req,res)=>{
    try{
        let updatedSeats=req.body;
        let validationErrors=validateInput(updatedSeats);
        if(validationErrors.length > 0)
             return res.status(400).json({errors:validationErrors});
        const result=updateAvailableSlotsOfPackage(updatedSeats);    
        res.status(200).json(result);    
    }catch(error){
        return res.status(500).json({error:error.message});
    }
   });

   function getBookingByPackageId(packageId){
     return {bookings:bookings.filter(ele => ele.packageId===packageId)};
   }

   app.get('/bookings/:packageId',(req,res)=>{
    try{
        let packageId=parseInt(req.params.packageId);
        if(!packageId)
             return res.status(400).json({error:"packageId is missing"});
        let result=getBookingByPackageId(packageId);
        if(result.bookings.length===0)
             return res.status(404).json({message:"No booking found in this packageId"});    
        return res.status(200).json(result);    
    }catch(error){
        res.status(500).json({error:error.message});
    }
   });
app.listen(PORT,()=>{
    console.log(`server is listening on port ${PORT}`);
});

module.exports=app;