const express = require("express");
const router = express.Router();
const PaytmChecksum = require("../Paytm/PaytmChecksum");
const { v4: uuidv4 } = require("uuid");
const formidable = require("formidable");
const https = require("https");
const Brain = require("../models/brainModel");
const axios = require("axios");

router.post("/callback", (req, res) => {
  const form = new formidable.IncomingForm();
  console.log(form,'form')

  form.parse(req, (err, fields, file) => {
    console.log(fields,'fields');
    const paytmChecksum = fields.CHECKSUMHASH;
    delete fields.CHECKSUMHASH;

    var isVerifySignature = PaytmChecksum.verifySignature(
      fields,
      process.env.KEY,
      paytmChecksum
    );
    if (isVerifySignature) {
      console.log("verifiedSignature");

      var paytmParams = {};
      paytmParams["MID"] = fields.MID;
      paytmParams["ORDERID"] = fields.ORDERID;

      /*
       * Generate checksum by parameters we have
       * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
       */
      PaytmChecksum.generateSignature(paytmParams, process.env.KEY).then(
        function (checksum) {
          paytmParams["CHECKSUMHASH"] = checksum;

          var post_data = JSON.stringify(paytmParams);

          var options = {
            /* for Staging */
            hostname: "securegw-stage.paytm.in",

            /* for Production */
            // hostname: 'securegw.paytm.in',

            port: 443,
            path: "/order/status",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": post_data.length,
            },
          };

          var response = "";
          var post_req = https.request(options, function (post_res) {
            post_res.on("data", function (chunk) {
              response += chunk;
            });

            post_res.on("end", async function () {
              // res.json(response);
              let result = JSON.parse(response);
              console.log(result.TXNAMOUNT);
             
              if (result.TXNAMOUNT === "49.00") {
                let id = "61fc1c3113c7a54fb2556030";
                const getBrain = await Brain.findById(id);
              

                if (getBrain) {
                  getBrain.brain = 10;

                  const updatedBrain = await getBrain.save();
				//   res.redirect(`http://localhost:3000/dashboard`);
				res.redirect(`https://quiz-app-bshal.vercel.app/dashboard`);
				 

                }
				
              }

             
            });
          });

          post_req.write(post_data);
          post_req.end();
        }
      );
    } else {
      console.log("Not verifiedSignature");
    }
  });
});

router.post("/payment", (req, res) => {
  const { amount, email } = req.body;
  const txtAmt = JSON.stringify(amount);

  var params = {};

  /* initialize an array */
  (params["MID"] = process.env.MID),
    (params["WEBSITE"] = process.env.WEBSITE),
    (params["CHANNEL_ID"] = process.env.CHANNEL_ID),
    (params["INDUSTRY_TYPE_ID"] = process.env.INDUSTRY_TYPE_ID),
    (params["ORDER_ID"] = uuidv4()),
    (params["CUST_ID"] = process.env.CUST_ID),
    (params["TXN_AMOUNT"] = txtAmt),
    (params["CALLBACK_URL"] = "https://quizzlyapp222.herokuapp.com/api/callback"),
    (params["EMAIL"] = email),
    (params["MOBILE_NO"] = "9876773210");

  /**
   * Generate checksum by parameters we have
   * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
   */
  var paytmChecksum = PaytmChecksum.generateSignature(params, process.env.KEY);
  paytmChecksum
    .then(function (checksum) {
      let paytmParams = {
        ...params,
        CHECKSUMHASH: checksum,
      };
      res.json(paytmParams);
    })
    .catch(function (error) {
      console.log(error);
    });
});

module.exports = router;
