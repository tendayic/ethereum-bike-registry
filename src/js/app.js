/* Function to dynamically add registered bike to DOM */
function addRegisteredBike(account, obj, name) {

    /* Close Modal */
    $('.btn-close').click();

    /* Get Date & Time */
    var date = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var month = months[date.getMonth()];
    var year = date.getFullYear();
    var day = date.getDate();
    var timeStamp = month + ", " + day + ", " + year;

    ownerAddr = account;
    console.log(obj);

    /* Append to Transactions */
    var transactionsDiv = $('#transactions');
    var column = $('<div>').addClass('col-md-6');
    var offset = $('<div>').addClass('col-md-4 offset-md-4');

    var addrVal = $('<p>').text(ownerAddr);
    var nameVal = $('<p>').text(name).addClass('name-col-md-6');
    var timeVal = $('<p>').text(timeStamp).addClass('time-col-md-6');

    column.append(addrVal);
    offset.append(timeVal);
    offset.append(nameVal);

    /* Append transaction details to div */
    transactionsDiv.append(column);
    transactionsDiv.append(offset);
}

/* Function to dynamically add transferred ownership to DOM */
function addTransferOwnership(transferBikeID, ethAddress) {

    /* Close Modal */
    $('.btn-close').click();

    /* Append to Transactions */
    var transferTransactionsDiv = $('#transferTransaction');

    var column = $('<div>').addClass('col-md-6');
    var offset = $('<div>').addClass('col-md-4 offset-md-4');

    var newOwner = $('<p>').text(ethAddress).addClass('new-col-md-6');
    var bikeVal = $('<p>').text(transferBikeID).addClass('bike-col-md-6');

    column.append(newOwner);
    offset.append(bikeVal);

    /* Append transaction details to div */
    transferTransactionsDiv.append(column);
    transferTransactionsDiv.append(offset);

}


/* JavaScript Smart Contract logic */
App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('BikeRegistry.json', function(data) {
      /* Get the necessary contract artifact file and instantiate it with truffle-contract */
      var BikeRegistryArtifact = data;
      App.contracts.BikeRegistry = TruffleContract(BikeRegistryArtifact);

      /* Set the provider for our contract */
      App.contracts.BikeRegistry.setProvider(App.web3Provider);

      return App.bindEvents();

    });

  },

  bindEvents: function() {
    $(document).on('click', '#registerBike', App.newBike);
    $(document).on('click', '#transferBike', App.transferOwnership);
  },

  newBike: function(event) {
    event.preventDefault();

    var BikeInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.BikeRegistry.deployed().then(function(instance) {
          console.log(instance);
          BikeInstance = instance;

          return BikeInstance.registerBike($('#name').val(), $('#color').val(), $('#wheels').val(), $('#brakes').val(), $('#basket').val());

      }).then(function(result) {

          console.log('Contract has been deployed!\n');

          addRegisteredBike(account, result, $('#name').val());

      }).catch(function(err) {
          console.log(err.message)
      });

    });

  },

  transferOwnership: function(event) {
      event.preventDefault();

      web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }

          var account = accounts[0];

          App.contracts.BikeRegistry.deployed().then(function(instance) {
              BikeInstance = instance;

              return BikeInstance.transferBike($('#transferBikeID').val(), $('#ethAddress').val());

          }).then(function(result) {
              console.log('Ownership has been transferred!\n');

              addTransferOwnership($('#transferBikeID').val(), $('#ethAddress').val());

          }).catch(function(err) {
              console.log(err.message);
          });
      });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
