import React, { Component, useState, useEffect } from "react";
import {Button, Modal, Checkbox, Input, Radio} from 'antd'
import "antd/dist/antd.css";
import "./main.css";

import PredictionContainer from '../../components/predictionContainer'

function Main1Container() {
    const [text, setText] = useState("");
    const [task, setTask] = useState(0);
    const [choice, setChoice] = useState(0);
    const [tmpUser, setTmpUser] = useState(0);
    const [imageData, setImageData] = useState([]);
    const [currentImage, setCurrentImage] = useState("");
    const [currentPrediction, setCurrentPrediction] = useState("");
    const [imageCount, setImageCount] = useState(0);
    const [showPrediction, setShowPrediction] = useState(false);
    const [taskTime, setTaskTime] = useState((Date.now() + 1000 * 1000));

    const [currentTime, setCurrentTime] = useState(0);
    const [moveToSurvey, setMoveToSurvey] = useState(false);

    const [render, setRender] = useState(false);

    let totalImages = 3;
    const baseImgUrl = "./";

    const nextChange = () =>{
        if (choice<1) {
            alert("Please make sure to complete all the fields!");
        } else {
            let count = imageCount + 1;
            // save data
            let data = {
                q_id: currentImage,
                user_id: tmpUser,
                ans: choice,
                input: text, 
                time: ((Date.now() - taskTime) / 1000).toFixed(3)
            };
            console.log(data)
            sendData(data)
            if (count >= totalImages) {
                console.log('done with images')
                setMoveToSurvey(true);
            } else {
                // reinitialize variables
                setChoice(0); 
                setText("")
                setImageCount(count);
                setCurrentImage(imageData[count].name);
                setCurrentPrediction(imageData[count].label);
                setTaskTime(Date.now())
                setShowPrediction(false);
            }
        }
    }

    const sendData = (obj) => {
        fetch('http://localhost:8080/responsesData', {
          method: 'POST',
          body: JSON.stringify(obj),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        }).then(response => response.json())
          .then(message => {
            console.log(message)
          })
      } 


    const onChangeMultiple= e => {
        setChoice(e.target.value);

    };

    const onChangeInput = e => {
        setText(e.target.value);
    };

    const handlePredict=()=>{
        setShowPrediction(true);
    };

    // testing communication with backend
    useEffect(() => {
        fetch('http://0.0.0.0:8080/time').then(res => 
        res.json()).then(data => {
            setCurrentTime(data.time);
            console.log(data.time)
        });
        }, []);

    // create a new user here 
    useEffect(() => {
        fetch('http://localhost:8080/setup_main')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            console.log(data['task_number']);
            setTask(data['task_number']);
            // send user id as well
            setTmpUser(data['user_id'])
        });
    }, []);
    

    // initialize image
    useEffect(() => {
        console.log('getting images')
        fetch('http://localhost:8080/imageInfo')
        .then(response => response.json())
        .then(data => {
            console.log(data['imgs']);
            setImageData(data['imgs']);
            let image_name = data['imgs'][0].name
            setCurrentImage(image_name)
            console.log(image_name)
            setCurrentPrediction(data['imgs'][0].label);
            setRender(true);
            setTaskTime(Date.now())
        });
    }, []);



    return (
      <>
       {render ?

            <div className="container">
            <div className="title">Main experiment</div>
            <div className="column-container"> 
            <div className="left-column"> 
                <p> This is how you load an image:</p>
                <div className="img-frame">
                    <img className="image-inner" src={baseImgUrl + currentImage}/>
                </div>
                <p> {imageCount + 1} / {totalImages} Images</p>
            </div>

            <div className="right-column"> 
            <div className="instr">
                <t> You can present the outcomes of the algorithms on this side:</t> 
            </div>
                
            
            <Button className="btn-1"  onClick={()=>{handlePredict()}}>
                Ask the AI 
            </Button>

            { showPrediction ?
                <PredictionContainer 
                    currentPrediction={currentPrediction}
                />
            :
                <>
                </>
            }

            <div className="instr">
                    <t> This is how you create a text box if you need user input:</t>
            </div>
            <input
                type="text"
                value={text}
                onChange={onChangeInput}
            />


            <div className="instr">
                <t> This is how you can ask a multiple choice question.</t>
            </div>    
                <Radio.Group onChange={onChangeMultiple} value={choice}>
                    <Radio value={1}> <t> Option 1</t></Radio>
                    <Radio value={2}> <t> Option 2</t></Radio>
                    <Radio value={3}> <t> Option 3</t></Radio>
                </Radio.Group>

            </div>
            </div>


            <div className="button-container"> 
                <Button variant="btn btn-success"  style={{marginLeft:"70%"}}  onClick={nextChange}>
                    Next
                </Button>
            </div>

            {(moveToSurvey) && 
            <div className="instr"> 
                <t> You have completed the three tasks. </t>
                
            </div>
            }

            </div>

        :
            <> 
            <h1> Loading ...</h1>
            </>
        }
      </>
       
      );
}

export default Main1Container;