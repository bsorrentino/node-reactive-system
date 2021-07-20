import inquirer, { Separator } from 'inquirer'

function list() {

  inquirer
  .prompt([
    {
      type: 'list',
      name: 'theme',
      message: 'What do you want to do?',
      choices: [
        'Order a pizza',
        'Make a reservation',
        new Separator(),
        'Ask for opening hours',
        {
          name: 'Contact support',
          disabled: 'Unavailable at this time',
        },
        'Talk to the receptionist',
      ],
    },
    {
      type: 'list',
      name: 'size',
      message: 'What size do you need?',
      choices: ['Jumbo', 'Large', 'Standard', 'Medium', 'Small', 'Micro'],
      filter: val =>  val.toLowerCase(),
    },
  ])
  .then((answers) => {
      console.log( answers )
  })

}

function list2() {
  
  inquirer
  .prompt([
    {
      type: 'list',
      name: 'subgen',
      message: 'Which kind of template dow you want?',
      choices: [
        {
          name: 'Generic',
          disabled: 'Unavailable at this time',
        },
        { 
          name: 'Detail List (Grid View)',
          value: 'pcf-fluentui:client'
        }
      ]
    },
    {
      type: 'input',
      name: 'componentName',
      message: 'Give me component name:',
      validate: ( input:string ) => {
        if( input.trim().length > 0 ) {
          return true
        }
        return 'please provide a valid name!'
      }
    }
  ])
  .then((answers) => {
      console.log( answers )
  })

}


list2()