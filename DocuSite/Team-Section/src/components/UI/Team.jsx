import React from 'react'
import '../../styles/team.css'
import robby from '../../images/Robby.png'


const teamMembers = [
    {
        imgUrl: robby,
        name: 'Robby Linson',
        position: 'Project Lead',
        linkedin: 'https://www.linkedin.com/in/robby-linson/',
        github: 'https://github.com/robbylinson' 
    },
]

const Team = () => {
    return (
        <section className='our__team'>
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