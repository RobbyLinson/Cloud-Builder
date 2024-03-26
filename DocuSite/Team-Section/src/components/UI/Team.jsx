import React from 'react'
import { Link } from 'react-router-dom';
import '../../styles/team.css'
import robby from '../../images/Robby.png'
import rohn from '../../images/Rohn.jpg'
import harry from '../../images/Harry.jpg'
import michal from '../../images/Michal.jpeg'
import robert from '../../images/Robert.jpg'
import ellen from '../../images/Ellen.jpg'
import yaroslav from '../../images/Yaroslav.jpg'
import yuuv from '../../images/Yuuv.jpg'
import vansh from '../../images/Vansh.jpg'
import nandini from '../../images/Nandini.jpg'
import sarah from '../../images/Sarah.png'


const teamMembers = [
    {
        imgUrl: robby,
        name: 'Robby Linson',
        position: 'Project Lead',
        linkedin: 'https://www.linkedin.com/in/robby-linson/',
        github: 'https://github.com/robbylinson' 
    },
    {
        imgUrl: harry,
        name: 'Harry Roche',
        position: 'Tech Lead',
        linkedin: 'https://www.linkedin.com/in/harry-roche1/',
        github: 'https://github.com/harroche' 
    },
    {
        imgUrl: rohn,
        name: 'Rohn Allen Santiago',
        position: 'CI/CD Lead',
        linkedin: '',
        github: 'https://github.com/rohn-allen-santiago' 
    },
    {
        imgUrl: sarah,
        name: 'Sarah Reider-Jacks',
        position: 'Documentation Lead',
        linkedin: '',
        github: '' 
    },
    {
        imgUrl: yuuv,
        name: 'Yuuv Jauhari',
        position: 'Senior Developer',
        linkedin: '',
        github: '' 
    },
    {
        imgUrl: nandini,
        name: 'Nandini Gupta',
        position: 'Social Media Lead',
        linkedin: '',
        github: '' 
    },
    {
        imgUrl: yaroslav,
        name: 'Yaroslav Kashulin',
        position: 'Provider Developer',
        linkedin: 'https://www.linkedin.com/in/yaroslav-kashulin-338713251/',
        github: 'https://github.com/Ktoettotakoy' 
    },
    {
        imgUrl: michal,
        name: 'Michał Naklicki',
        position: 'Provider Developer',
        linkedin: '',
        github: '' 
    },
    {
        imgUrl: ellen,
        name: 'Ellen Brennan',
        position: 'CLI Developer',
        linkedin: 'https://www.linkedin.com/in/ellen-brennan-b54053279/',
        github: 'https://github.com/EBrenne228' 
    },
    {
        imgUrl: robert,
        name: 'Robert Mee Lucey',
        position: 'Provider Developer',
        linkedin: 'https://www.linkedin.com/in/robert-mee-lucey-a4a1b5226',
        github: 'https://github.com/robertmeelucey' 
    },
    {
        imgUrl: vansh,
        name: 'Vansh Khetan',
        position: 'CLI Developer',
        linkedin: '',
        github: '' 
    },
]

const Team = () => {
    return (
        <section className='our__team'>
            <Link to="/" className="home-button">Home</Link>
            <div className='container'>
                <div className='team__content'>
                    <h6 className='subtitle'>Cloud Builder</h6>
                    <h2>
                        Meet the <span className='highlight'> Team</span>
                    </h2>
                </div>
                <div className='team__wrapper'>
                    {
                        teamMembers.map((item, index) => (
                            <div className='team__item' key={index}>
                                <div className='team__img'>
                                    <img src={item.imgUrl} alt='' />
                                </div>
                                <div className='team__details'>
                                    <h4>{item.name}</h4>
                                    <p className='description'>{item.position}</p>

                                    <div className='team__member-social'>
                                        <a href={item.linkedin}><i class='ri-linkedin-line'></i></a>
                                        <a href={item.github}><i class='ri-github-line'></i></a>

                                        {/* <a href={item.linkedin} target="_blank" rel="noopener noreferrer"> <img src="path_to_your_linkedin_icon.png" alt="LinkedIn" /></a> */}

                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    )
}

export default Team