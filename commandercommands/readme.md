# Commander: Commands

This component can process received commands from Commander application.

__Data__:
- `data.type` can be `command` or `option`
- `data.body` contains a body of message `{String}`
- `data.user` contains an user instance `{Object}`
- `data.id` contains an identificator for options/message

__Outputs__:
- `red` is a basic command
- `blue` is an option from options