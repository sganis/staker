import React from 'react';

const BodyData = (props) => {
    const files = [
        {name : 'file1.txt', type: 'file' },
        {name : 'file1.txt', type: 'file' },
        {name : 'file1.txt', type: 'file' },
        {name : 'folder', type: 'dir' },
    ];
    return props.children({
        files: files
    });
}

const Body = () => {
    return (<BodyData>{({files}) => {
        return (<div>{
            files.map(f => {
            return (<div>
                <img src={`/images/${f.type}.png`} width='16'/>&nbsp;
                <span>{f.name}</span>
                </div>)})
            }</div>)
    }}</BodyData>
    );
}
 
export default Body;