interface IPrueba<TOne, TTwo> {
  name: TOne;
  age: TTwo;
}

export const Prueba = <TOne, TTwo>({ name, age }: IPrueba<TOne, TTwo>) => {
  console.log(name);
  console.log(age);
  return <div></div>;
};

export const Final = () => {
  return (
    <div>
      <Prueba name="nico" age={35}></Prueba>
    </div>
  );
};
