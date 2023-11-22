import React from 'react' ;
import '../css/navbar.css' ;
import { useRef } from 'react';
import { Navbar ,  Dropdown , Nav , Button, DropdownButton } from 'react-bootstrap';
import compile from './compile';

const Navbars = ({ language, setLanguage , setCompile , setShowloading,langRef , stopCompiling}) => {

    const handleinput = () => {
        
        setCompile(1)
        setShowloading(1)
    }
    return(
        <Navbar id='navbars' expand="lg" >
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav id='inner-navbar'>
    
                        <Button variant='success' className='runstop-button' onClick={ handleinput }>Run</Button>
                        <Button variant='success' className='runstop-button' onClick={stopCompiling}>Stop</Button>
                     
                        <Dropdown ref={langRef}   className='runstop-button' variant='dark' onSelect={ (value) => setLanguage(value) }>
                            <Dropdown.Toggle variant="dark" >
                            { language || 'Languages' }
                            </Dropdown.Toggle>

                            <Dropdown.Menu >
                            <Dropdown.Item eventKey="c">C</Dropdown.Item>
                            <Dropdown.Item eventKey="cpp14">C++ 14</Dropdown.Item>
                            <Dropdown.Item eventKey="cpp17">C++ 17</Dropdown.Item>
                            <Dropdown.Item eventKey="python2">Python2</Dropdown.Item>
                            <Dropdown.Item eventKey="python3">Python3</Dropdown.Item>
                            <Dropdown.Item eventKey="java">Java</Dropdown.Item>
                            <Dropdown.Item eventKey="php">PHP</Dropdown.Item>
                            <Dropdown.Item eventKey="bash">Bash</Dropdown.Item>
                            <Dropdown.Item eventKey="csharp">C#</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                      
                   
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default Navbars ;