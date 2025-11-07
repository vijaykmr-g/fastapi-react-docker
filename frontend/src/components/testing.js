function Testing({car}){
    const {brand,color,year} = car
    console.log({car})
    return (
        <p>Testing the car {brand}, color is {color}, year-{year}</p>
    )
}

// export default Testing