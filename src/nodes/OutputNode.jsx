import { Handle, Position } from 'reactflow';

function OutputNode() {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #F5B03A 6.16%, #D65B27 93.1%)',
        borderRadius: '20px',
      }}
      className=" flex justify-center items-center  text-center p-4  border border-1 border-[#FFF] text-2xl font-semibold  w-52 h-40"
    >
      <p className="mb-2 ">Output</p>

      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export default OutputNode;
