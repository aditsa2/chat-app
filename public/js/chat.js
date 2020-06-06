const socket = io()

const $form_message = document.querySelector('#form-message')
const $message_place = document.querySelector('#message')
const $sidebar = document.querySelector('.chat__sidebar')
const $messageFormInput = $form_message.querySelector('input')
const $messageFormBtn = $form_message.querySelector('button')
const $sendLocatinBtn = document.querySelector('#send-location')

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //new message element
    const $newMessage = $message_place.lastElementChild
    //Height of the new element
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //visible hieght
    const visibleHeight = $message_place.offsetHeight
    //Height of messages container
    const containerHeight = $message_place.scrollHeight
    //How far have I scrolled?
    const scrollOffset = $message_place.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $message_place.scrollTop = $message_place.scrollHeight
    }
}

socket.on('message', (message) => {
    if (message.text.trim() === '')
        return
    // $message_place.textContent = message.text
    var div = document.createElement("DIV");
    div.classList.add('message')
    var bigPara = document.createElement("P");
    var span1 = document.createElement("SPAN")
    span1.classList.add("message__name");
    var span2 = document.createElement("SPAN")
    span2.classList.add("message__meta");
    span1.textContent = message.usernameFromServer
    const time = moment(message.createdAt).format('HH:mm')
    span2.textContent = time
    bigPara.appendChild(span1);
    bigPara.appendChild(span2);
    var para = document.createElement("P");
    para.textContent = message.text;
    div.appendChild(bigPara)
    div.appendChild(para)
    $message_place.appendChild(div);
    autoscroll()
})

socket.on('locationMessage', ({ message, usernameFromServer }) => {
    var div = document.createElement("DIV");
    div.classList.add('message')
    var bigPara = document.createElement("P");
    var span1 = document.createElement("SPAN")
    span1.classList.add("message__name");
    var span2 = document.createElement("SPAN")
    span2.classList.add("message__meta");
    span1.textContent = usernameFromServer
    const time = moment(new Date().getTime()).format('HH:mm')
    span2.textContent = time
    bigPara.appendChild(span1);
    bigPara.appendChild(span2);
    var para1 = document.createElement("P");
    var para2 = document.createElement("A");
    para2.textContent = "My current location";
    para2.href = message
    para2.target = "_blank"
    para1.appendChild(para2)
    div.appendChild(bigPara)
    div.appendChild(para1)
    $message_place.appendChild(div);
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    var h2 = document.createElement("H2")
    h2.innerHTML = room
    h2.classList.add("room-title")
    var h3 = document.createElement("H3")
    h3.innerHTML = "Users"
    h3.classList.add("list-title")
    var ul = document.createElement("UL")
    ul.classList.add("users")
    const usersList = users.map(user => `<li>${user.username}</li>`)
    usersList.forEach(user => ul.innerHTML += user)
    $sidebar.innerHTML = ''
    $sidebar.appendChild(h2)
    $sidebar.appendChild(h3)
    $sidebar.appendChild(ul)
})

$form_message.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormBtn.setAttribute("disabled", "disabled")
    const message = e.target.elements.message.value
    socket.emit('send_message', message, () => {
        $messageFormBtn.removeAttribute("disabled")
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })
})

$sendLocatinBtn.addEventListener('click', () => {
    $sendLocatinBtn.setAttribute("disabled", "disabled")
    if (!navigator.geolocation) {
        $sendLocatinBtn.removeAttribute("disabled")
        return alert('Gealocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        console.log({ lat: position.coords.latitude, long: position.coords.longitude })
        socket.emit('SendLocation', { lat: position.coords.latitude, long: position.coords.longitude }, () => {
            $sendLocatinBtn.removeAttribute("disabled")
            console.log('Location has been send')
        })
    })
})

socket.emit('join', { username, room }, error => {
    if (error) {
        alert(error)
        location.href = "./"
    }
})