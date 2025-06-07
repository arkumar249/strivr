console.log("I am Working...... i am being changed");
let currentSong=new Audio();
let songs, title;
let img_play_button=document.querySelector("#play");
async function getSongs(song_folder) {
    
    let a = await fetch(`/${song_folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
   
    
    let songs = [];
    let title = [];
    let as = div.getElementsByTagName("a");
   
    for (let idx = 0; idx < as.length; idx++) {
        let ele = as[idx];
        if (ele.href.endsWith(".m4a")) {
            songs.push(ele.href)
            title.push(ele.title.replace(".m4a", ""));
        }

    }
   
    return [songs, title];

}
async function addPlaylist(){
    let songList = document.querySelector(".songList ul");
     
    songList.innerHTML="";
   
    for(let i=0 ; i<title.length ; i++){
        let si=document.createElement("li");
        si.innerHTML=`<img class="invert" width="34" src="Images/music.svg" alt="">
                            <div class="info">
                                <div> <a href="${songs[i]}"> ${title[i]} </a></div>
                                <div>Artist Name</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="Images/play.svg" alt="">
                            </div> `;
        songList.append(si);

    }
}

// function for adding folders dynamically
async function displayAlbums() {
   
    let res=await fetch(`/songs/`)
    let response=await res.text();
    
    let div=document.createElement("div");
    div.innerHTML=response;
  
    let as= Array.from(div.getElementsByTagName("a"));
 


    let cardContainer=document.querySelector(".cardContainer");
    for(let i=1 ; i<as.length ; i++){
        if(as[i].href.includes("/songs")){
            if(as[i].title=="") continue;
            let song_folder=as[i].title;
       
           let dat= await fetch(`/songs/${song_folder}/info.json`);
           let data_txt=await dat.json();
     
           cardContainer.innerHTML=cardContainer.innerHTML + `<div  data-folder= "${song_folder}"  class="card">
                        <img src="/songs/${song_folder}/cover.jpg" alt="image">
                        <div class="play-button">▶</div>
                        <h2> ${data_txt.title}</h2>
                        <span>${data_txt.description}</span>
                    </div>`


        }
    }
    let cards = Array.from(document.getElementsByClassName('card'));
 
 
  cards.forEach(e=>{
    e.addEventListener("click" ,  async (items)=>{
       
       
        let path= `songs/${e.dataset.folder}`;
        [songs , title] = await getSongs(path);
        await addPlaylist();
        addSongListListeners()
        playRandom(false);
    })
  })
   

    
}

const playMusic= (link , title_name , pause=false)=>{
    currentSong.src=link;
    if(!pause){
        currentSong.play();
        img_play_button.src="Images/pause.svg";
    }
    
    document.querySelector(".song-info").innerHTML=title_name;
    document.querySelector(".song-time").innerHTML="00:00 / 00:00";
}
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
// for playing song when reloads
const playRandom=(paused=true)=>{
    let idx=Math.floor(songs.length*Math.random()); 
    playMusic(songs[idx] , title[idx] , paused);
}


function addSongListListeners() {
    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", element => {
          
            if (element.target.tagName.toLowerCase() == "a") element.preventDefault();
            const link = e.querySelector(".info a");
            if (link) {
               
                playMusic(link.href, link.innerText);
            }
        });
    });
}

async function main() {
   
  
    [songs, title] = await getSongs(`songs2`)
    
    addPlaylist();

    //playing randomly 
   playRandom();
     
    
    await displayAlbums();
    addSongListListeners() 

    // event listener to play
    play.addEventListener("click" , ()=>{
        
        if(currentSong.paused){
            currentSong.play();
            
            img_play_button.src="Images/pause.svg";
        }
        else{
            currentSong.pause();
           img_play_button.src="Images/play.svg";
        }
    })

    // event listener to previous and next
    previous.addEventListener("click" , ()=>{
     
        let idx=songs.indexOf(currentSong.src);
  
        if(idx-1<0) idx=songs.length;
        playMusic(songs[idx-1] , title[idx-1]);
    })
    next.addEventListener("click" , ()=>{
  
        let idx=songs.indexOf(currentSong.src);
   
        playMusic(songs[(idx+1)%(songs.length)] , title[(idx+1)%(songs.length)]);
    })

    // time update event listener
    currentSong.addEventListener("timeupdate" , ()=>{
      
        if(currentSong.paused){
            img_play_button.src="Images/play.svg";
        }
        document.querySelector(".song-time").innerHTML=`${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".seekbar .circle").style.left=(currentSong.currentTime/currentSong.duration)*100+"%";
    })
    seekbar.addEventListener('click', (e)=> {
  
    const rect = seekbar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent =( x / rect.width);
   
    document.querySelector(".seekbar .circle").style.left=`calc(${percent*100}% - 0.4rem)`; 
    currentSong.currentTime = percent * currentSong.duration;
    
});


hamburger.addEventListener("click" , ()=>{
 
    document.getElementsByClassName("left")[0].style.left=0 ;
    document.querySelector(".home .logo .close_ham").style.display= "block";
})
document.querySelector(".home .logo .close_ham").addEventListener("click" , ()=>{
    document.getElementsByClassName("left")[0].style.left="-100%";
})

vol_slider.addEventListener("input" , (e)=>{
    console.log(e.target.value);
    currentSong.volume=e.target.value/100;
    
})
// event listener to volume button
currentSong.addEventListener("volumechange" , ()=>{
    console.log("volume is " , currentSong.volume);
    vol_slider.value=currentSong.volume*100;
    if(currentSong.volume==0){
        volume_btn.src="Images/mute.svg";
        
    }
    else{
        volume_btn.src="Images/volume.svg";
    }
    
})
volume_btn.addEventListener("click" , ()=>{
    if(currentSong.muted){
     
        currentSong.volume=0.4;
        currentSong.muted=false;
        volume_btn.src="Images/volume.svg";

    }
    else{
       
        currentSong.muted=true;
     
        currentSong.volume=0;
        volume_btn.src="Images/mute.svg";

    }
})
    
}
main();



